import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SPREADSHEET_ID,
  WORKSHEET_ID,
  EVENT_ID_COLUMN,
  DATE_COLUMN,
  DURATION_COLUMN,
  SUMMARY_COLUMN,
  NOTES_COLUMN,
} from "@/config";
import googleSheets from "@/connections/google-sheets";

const sdk = createZapierSdk();

const InputSchema = z
  .object({
    id: z.string(),
    summary: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    start: z
      .object({ dateTime: z.string().nullable().optional() })
      .loose()
      .nullable()
      .optional(),
    duration_minutes: z.union([z.number(), z.string()]).nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "update-lesson-log-row-from-edited-calendar-event",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const eventId = String(input.id).trim();
    const values = {
      [DATE_COLUMN]: (input.start?.dateTime ?? "").slice(0, 10),
      [DURATION_COLUMN]: String(input.duration_minutes ?? ""),
      [SUMMARY_COLUMN]: input.summary ?? "",
      [NOTES_COLUMN]: input.description ?? "",
    };

    const lookup = await ctx.step("find-lesson-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "search",
        actionKey: "lookup_row",
        connection: googleSheets,
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          lookup_key: EVENT_ID_COLUMN,
          lookup_value: eventId,
        },
      }),
    );

    const row = lookup.data?.[0] as { id?: number | string } | undefined;

    if (row?.id) {
      const update = await ctx.step("update-lesson-row", async () =>
        sdk.runAction({
          appKey: "google-sheets",
          actionType: "write",
          actionKey: "update_row",
          connection: googleSheets,
          inputs: {
            spreadsheet: SPREADSHEET_ID,
            worksheet: WORKSHEET_ID,
            row: String(row.id),
            [EVENT_ID_COLUMN]: eventId,
            ...values,
          },
        }),
      );

      return {
        eventId,
        action: "updated",
        row: row.id,
        result: update.data?.[0] ?? null,
      };
    }

    const created = await ctx.step("add-lesson-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: googleSheets,
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          [EVENT_ID_COLUMN]: eventId,
          ...values,
        },
      }),
    );

    return { eventId, action: "created", result: created.data?.[0] ?? null };
  },
);

export default workflow;
