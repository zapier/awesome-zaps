import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Sheets spreadsheet ID for the central billing sheet (the long ID in the sheet's URL).
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID; the first tab is "0".
const WORKSHEET_ID = "0";
// Projects whose time is internal and never billed. Matched exactly against the payload's project name.
const INTERNAL_PROJECTS = ["Internal"];
// Categories that are not billable. Matched exactly against the payload's category.
const NON_BILLABLE_CATEGORIES = ["Non-billable"];
// Sheet column keys (COL$A = column A). Map these to the billing sheet's headers.
const ENTRY_ID_COLUMN = "COL$A";
const DATE_COLUMN = "COL$B";
const STAFF_COLUMN = "COL$C";
const PROJECT_COLUMN = "COL$D";
const HOURS_COLUMN = "COL$E";
const DESCRIPTION_COLUMN = "COL$F";

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    start: z.string(),
    end: z.string(),
    user_name: z.string().nullable().optional(),
    project: z.string().nullable().optional(),
    tags: z.array(z.string()).nullable().optional(),
    category: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "log-completed-time-entries-into-central-billing-sheet",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const entryId = String(input.id).trim();
    const project = input.project ?? "";
    const category = input.category ?? "";

    if (
      INTERNAL_PROJECTS.includes(project) ||
      NON_BILLABLE_CATEGORIES.includes(category)
    ) {
      return {
        skipped: true,
        reason: "internal-project-or-non-billable",
        entryId,
      };
    }

    const startMs = Date.parse(input.start);
    const endMs = Date.parse(input.end);
    if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) {
      return { skipped: true, reason: "invalid-interval", entryId };
    }

    const hours = Math.round(((endMs - startMs) / 3600000) * 100) / 100;
    // Date part of the ISO end timestamp, as MM/DD/YYYY (no Date object: it is non-deterministic in a workflow).
    const date = `${input.end.slice(5, 7)}/${input.end.slice(8, 10)}/${input.end.slice(0, 4)}`;
    const description = [(input.tags ?? []).join(", "), input.notes ?? ""]
      .filter(Boolean)
      .join(" - ");

    const existing = await ctx.step("find-existing-entry-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "search",
        actionKey: "lookup_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          lookup_key: ENTRY_ID_COLUMN,
          lookup_value: entryId,
        },
      }),
    );

    if (existing.data?.[0]) {
      return { skipped: true, reason: "duplicate-entry", entryId };
    }

    const appended = await ctx.step("append-billing-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          [ENTRY_ID_COLUMN]: entryId,
          [DATE_COLUMN]: date,
          [STAFF_COLUMN]: input.user_name ?? "",
          [PROJECT_COLUMN]: project,
          [HOURS_COLUMN]: String(hours),
          [DESCRIPTION_COLUMN]: description,
        },
      }),
    );

    return { entryId, date, hours, appended: appended.data?.[0] ?? null };
  },
);

export default workflow;
