import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  CATEGORY_PROPERTY,
  SEEDED_CONTENT_PROPERTY,
  SPREADSHEET_ID,
  WORKSHEET_ID,
  CATEGORY_COLUMN,
  NOTION_VERSION,
  NOTION_API,
} from "@/config";
import notion from "@/connections/notion";
import googleSheets from "@/connections/google-sheets";

const sdk = createZapierSdk();

// Columns copied into the page, with the label shown before each value.
const CONTENT_COLUMNS: Record<string, string> = {
  COL$B: "Title",
  COL$C: "Steps",
  COL$D: "Expected result",
};
// Most rows returned per lookup (the Sheets action allows up to 500).
const ROW_LIMIT = 500;

// Notion caps one rich-text item at 2,000 characters.
const MAX_RICH_TEXT = 2000;

const InputSchema = z
  .object({
    id: z.string(),
  })
  .loose();

type NotionProperty = {
  type?: string;
  select?: { name?: string } | null;
  status?: { name?: string } | null;
  multi_select?: { name?: string }[];
  rich_text?: { plain_text?: string }[];
  title?: { plain_text?: string }[];
};

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

function propertyText(prop: NotionProperty | undefined): string {
  if (!prop) return "";
  if (prop.select) return prop.select.name ?? "";
  if (prop.status) return prop.status.name ?? "";
  if (prop.multi_select) return prop.multi_select[0]?.name ?? "";
  const parts = prop.rich_text ?? prop.title ?? [];
  return parts.map((p) => p.plain_text ?? "").join("");
}

// Marks content this workflow wrote, so its own page edit doesn't reseed in a loop.
function seedMarker(category: string): string {
  return `[seeded for: ${category}]`;
}

const workflow = defineDurable<unknown, unknown>(
  "populate-qa-backlog-items-with-randomized-test-content",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(normalizeInput(rawInput));
    const pageId = input.id;

    const page = await ctx.step("get-qa-page", async () => {
      const response = await sdk.fetch(`${NOTION_API}/pages/${pageId}`, {
        connection: notion,
        method: "GET",
        headers: { "Notion-Version": NOTION_VERSION },
      });
      if (!response.ok) {
        throw new Error(
          `Notion returned ${response.status}: ${(await response.text()).slice(0, 300)}`,
        );
      }
      const body = (await response.json()) as {
        properties?: Record<string, NotionProperty>;
      };
      const properties = body.properties ?? {};
      return {
        category: propertyText(properties[CATEGORY_PROPERTY]).trim(),
        seeded: propertyText(properties[SEEDED_CONTENT_PROPERTY]),
        hasSeededProperty: SEEDED_CONTENT_PROPERTY in properties,
      };
    });

    if (!page.hasSeededProperty) {
      throw new Error(
        `The Notion data source has no "${SEEDED_CONTENT_PROPERTY}" property`,
      );
    }
    if (!page.category) {
      return { skipped: true, reason: "no-category", pageId };
    }
    if (page.seeded.startsWith(seedMarker(page.category))) {
      return {
        skipped: true,
        reason: "already-seeded-for-category",
        pageId,
        category: page.category,
      };
    }

    const lookup = await ctx.step("find-content-rows", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "search",
        actionKey: "find_many_rows",
        connection: googleSheets,
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          lookup_key: CATEGORY_COLUMN,
          lookup_value: page.category,
          row_count: ROW_LIMIT,
        },
      }),
    );

    const rows = (
      (lookup.data?.[0] as { rows?: Record<string, unknown>[] } | undefined)
        ?.rows ?? []
    ).map((row) =>
      Object.fromEntries(
        Object.keys(CONTENT_COLUMNS).map((col) => [
          col,
          row[col] == null ? "" : String(row[col]),
        ]),
      ),
    );
    if (rows.length === 0) {
      return {
        skipped: true,
        reason: "no-content-rows",
        pageId,
        category: page.category,
      };
    }

    const pickedIndex = await ctx.step("pick-random-row", async () =>
      Math.floor(Math.random() * rows.length),
    );
    const picked = rows[pickedIndex];

    const lines = Object.entries(CONTENT_COLUMNS)
      .filter(([col]) => picked[col])
      .map(([col, label]) => `${label}: ${picked[col]}`);
    const content = [seedMarker(page.category), ...lines]
      .join("\n")
      .slice(0, MAX_RICH_TEXT);

    await ctx.step("write-seeded-content", async () => {
      const response = await sdk.fetch(`${NOTION_API}/pages/${pageId}`, {
        connection: notion,
        method: "PATCH",
        headers: {
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            [SEEDED_CONTENT_PROPERTY]: {
              rich_text: [{ type: "text", text: { content } }],
            },
          },
        }),
      });
      if (!response.ok) {
        throw new Error(
          `Notion returned ${response.status}: ${(await response.text()).slice(0, 300)}`,
        );
      }
      return { ok: true };
    });

    return {
      pageId,
      category: page.category,
      candidates: rows.length,
      pickedIndex,
      content,
    };
  },
);

export default workflow;
