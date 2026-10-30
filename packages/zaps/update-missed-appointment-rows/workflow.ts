import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Sheets spreadsheet ID (the long ID in the sheet's URL).
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID; the first tab is "0".
const WORKSHEET_ID = "0";
// Column holding the attendee identifier to match on (COL$A = column A).
const ATTENDEE_ID_COLUMN = "COL$A";
// Column for the attendance status, overwritten with NO_SHOW_VALUE.
const STATUS_COLUMN = "COL$C";
// Column for the time the row was marked.
const LAST_UPDATED_COLUMN = "COL$D";
// Column for the note about where the update came from.
const COMMENTS_COLUMN = "COL$E";
// Status written to the matching row.
const NO_SHOW_VALUE = "No-show";

const InputSchema = z
  .object({
    attendee_id: z.union([z.string(), z.number()]),
    source: z.string().nullable().optional(),
    reason: z.string().nullable().optional(),
    submitted_at: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "update-missed-appointment-rows",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const attendeeId = String(input.attendee_id).trim();

    const lookup = await ctx.step("find-attendee-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "search",
        actionKey: "lookup_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          lookup_key: ATTENDEE_ID_COLUMN,
          lookup_value: attendeeId,
        },
      }),
    );

    const row = lookup.data?.[0] as { id?: number | string } | undefined;
    if (!row?.id) {
      return { skipped: true, reason: "attendee-not-found", attendeeId };
    }

    const markedAt = await ctx.step("capture-marked-at", async () =>
      new Date().toISOString(),
    );

    const details = [
      input.source ? `source: ${input.source}` : null,
      input.reason ? `reason: ${input.reason}` : null,
      input.submitted_at ? `submitted: ${input.submitted_at}` : null,
    ].filter(Boolean);
    const comment = `Marked ${NO_SHOW_VALUE} by absence webhook${details.length ? ` (${details.join("; ")})` : ""}`;

    const update = await ctx.step("mark-row-no-show", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "update_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          row: String(row.id),
          [STATUS_COLUMN]: NO_SHOW_VALUE,
          [LAST_UPDATED_COLUMN]: markedAt,
          [COMMENTS_COLUMN]: comment,
        },
      }),
    );

    return {
      attendeeId,
      row: row.id,
      markedAt,
      comment,
      updated: update.data?.[0] ?? null,
    };
  },
);

export default workflow;
