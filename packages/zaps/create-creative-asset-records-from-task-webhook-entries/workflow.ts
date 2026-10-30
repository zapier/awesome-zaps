import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Notion data source (database) of creative requests. Share it with the connected Notion integration.
const REQUESTS_DATA_SOURCE = "YOUR_REQUESTS_DATA_SOURCE_ID";
// Notion data source (database) of creative asset records.
const ASSETS_DATA_SOURCE = "YOUR_ASSETS_DATA_SOURCE_ID";
// Requests property that holds the task permalink URL, matched when looking for an existing request.
const REQUEST_PERMALINK_PROPERTY = "Permalink";
// Requests title property, set when a new request is created.
const REQUEST_TITLE_PROPERTY = "Name";
// Assets title property.
const ASSET_TITLE_PROPERTY = "Name";
// Assets property that holds the asset URL.
const ASSET_URL_PROPERTY = "URL";
// Assets relation property that links each record to its request.
const ASSET_REQUEST_PROPERTY = "Request";
// Assets status property, and the value new records get.
const ASSET_STATUS_PROPERTY = "Status";
const ASSET_STATUS_NEW = "New";
// Base URL for asset links: `${ASSET_URL_BASE}/${boardId}/${assetId}`, or `${ASSET_URL_BASE}/${assetId}` without a board.
const ASSET_URL_BASE = "https://YOUR_ASSET_HOST";
// Filename segments in order, split on "_" with the extension dropped, mapped to assets property names.
const FILENAME_PROPERTIES = {
  format: "Format",
  visualStyle: "Visual Style",
  source: "Source",
  theme: "Theme",
  cta: "CTA",
  creator: "Creator",
} as const;
type FilenameField = keyof typeof FILENAME_PROPERTIES;
const FILENAME_FIELDS = Object.keys(FILENAME_PROPERTIES) as FilenameField[];

const InputSchema = z
  .object({
    task_id: z.union([z.string(), z.number()]).nullable().optional(),
    task_permalink: z.string(),
    asset_link: z.string().nullable().optional(),
    board_id: z.union([z.string(), z.number()]).nullable().optional(),
    assignee: z.string().nullable().optional(),
    assets: z
      .array(
        z
          .object({
            title: z.string(),
            id: z.union([z.string(), z.number()]),
          })
          .loose(),
      )
      .nullable()
      .optional(),
  })
  .loose();

function parseFilename(title: string): Record<FilenameField, string | null> {
  const stem = title.replace(/\.[^.]+$/, "");
  const parts = stem.split("_");
  return Object.fromEntries(
    FILENAME_FIELDS.map((field, index) => [
      field,
      parts[index]?.trim() || null,
    ]),
  ) as Record<FilenameField, string | null>;
}

const workflow = defineDurable<unknown, unknown>(
  "create-creative-asset-records-from-task-webhook-entries",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const assets = input.assets ?? [];

    if (input.asset_link && !/^https:\/\//.test(input.asset_link)) {
      return { skipped: true, reason: "invalid-asset-link" };
    }
    if (assets.length === 0) {
      return { skipped: true, reason: "no-assets" };
    }

    const permalink = input.task_permalink.trim();

    const existing = await ctx.step("find-request-by-permalink", async () =>
      sdk.runAction({
        appKey: "notion",
        actionType: "search",
        actionKey: "find_data_source_item",
        connection: "notion",
        inputs: {
          datasource: REQUESTS_DATA_SOURCE,
          [REQUEST_PERMALINK_PROPERTY]: permalink,
        },
      }),
    );

    let requestId: string | null =
      (existing.data[0]?.id as string | undefined) ?? null;
    let requestCreated = false;

    if (!requestId) {
      const created = await ctx.step("create-request-for-task", async () =>
        sdk.runAction({
          appKey: "notion",
          actionType: "write",
          actionKey: "create_database_item",
          connection: "notion",
          inputs: {
            datasource: REQUESTS_DATA_SOURCE,
            template_mode: "none",
            [REQUEST_TITLE_PROPERTY]: `Task ${input.task_id ?? permalink}${input.assignee ? ` (${input.assignee})` : ""}`,
            [REQUEST_PERMALINK_PROPERTY]: permalink,
          },
        }),
      );
      requestId = (created.data[0]?.id as string | undefined) ?? null;
      requestCreated = true;
    }

    let recorded = 0;
    let failed = 0;

    for (const [index, asset] of assets.entries()) {
      const assetId = String(asset.id);
      const meta = parseFilename(asset.title);
      const url = input.board_id
        ? `${ASSET_URL_BASE}/${input.board_id}/${assetId}`
        : `${ASSET_URL_BASE}/${assetId}`;

      const result = await ctx.step(
        `create-asset-record-${index}`,
        async () => {
          try {
            const item = await sdk.runAction({
              appKey: "notion",
              actionType: "write",
              actionKey: "create_database_item",
              connection: "notion",
              inputs: {
                datasource: ASSETS_DATA_SOURCE,
                template_mode: "none",
                [ASSET_TITLE_PROPERTY]: asset.title,
                [ASSET_URL_PROPERTY]: url,
                [ASSET_STATUS_PROPERTY]: ASSET_STATUS_NEW,
                ...(requestId ? { [ASSET_REQUEST_PROPERTY]: [requestId] } : {}),
                ...Object.fromEntries(
                  FILENAME_FIELDS.map((field) => [
                    FILENAME_PROPERTIES[field],
                    meta[field],
                  ]),
                ),
              },
            });
            return { ok: true, id: item.data[0]?.id ?? null };
          } catch (error) {
            return { ok: false, error: String(error) };
          }
        },
      );

      if (result.ok) {
        recorded += 1;
      } else {
        failed += 1;
      }
    }

    return { requestId, requestCreated, recorded, failed };
  },
);

export default workflow;
