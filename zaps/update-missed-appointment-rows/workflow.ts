import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SPREADSHEET_ID,
  WORKSHEET_ID,
  ATTENDEE_ID_COLUMN,
  STATUS_COLUMN,
  LAST_UPDATED_COLUMN,
  COMMENTS_COLUMN,
  NO_SHOW_VALUE,
} from "./config.ts";

const sdk = createZapierSdk();

const InputSchema = z
  .object({
    attendee_id: z.union([z.string(), z.number()]),
    source: z.string().nullable().optional(),
    reason: z.string().nullable().optional(),
    submitted_at: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
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
