import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  WORKBOOK_ID,
  WORKSHEET_ID,
  LOOKUP_COLUMN,
  KPI_COLUMN,
} from "./config.ts";

const sdk = createZapierSdk();

const InputSchema = z
  .object({
    attachment__file: z.string().nullable().optional(),
    attachment__fileName: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
  "update-kpi-row-with-csat-percentage-from-email-pd-fs",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const fileName = input.attachment__fileName ?? "";

    if (!input.attachment__file || !/\.pdf$/i.test(fileName)) {
      return { skipped: true, reason: "not-a-pdf", fileName };
    }

    const lookupValue = fileName.replace(/\.pdf$/i, "");

    const extraction = await ctx.step("extract-csat-percentage", async () =>
      sdk.runAction({
        appKey: "chatgpt",
        actionType: "write",
        actionKey: "conversation_responses_api",
        connection: "chatgpt",
        inputs: {
          model: "gpt-4o",
          user_message:
            "Read the attached PDF. Reply with only the first numeric percentage in it, such as 87%. If there is none, reply MISSING.",
          files: [input.attachment__file],
          max_tokens: 50,
        },
      }),
    );

    const reply = String(
      (extraction.data[0] as { output?: unknown } | undefined)?.output ?? "",
    );
    const percent = reply.match(/\d+(?:\.\d+)?%/)?.[0];
    if (!percent) {
      return { skipped: true, reason: "no-percentage-found", fileName };
    }

    const found = await ctx.step("find-kpi-row", async () =>
      sdk.runAction({
        appKey: "excel",
        actionType: "search",
        actionKey: "find_row",
        connection: "excel",
        inputs: {
          workbook_id: WORKBOOK_ID,
          worksheet_id: WORKSHEET_ID,
          lookup_key: LOOKUP_COLUMN,
          lookup_value: lookupValue,
        },
      }),
    );

    const row = found.data[0] as { id?: number | string } | undefined;
    if (!row?.id) {
      return { skipped: true, reason: "row-not-found", lookupValue };
    }

    const update = await ctx.step("write-kpi-percentage", async () =>
      sdk.runAction({
        appKey: "excel",
        actionType: "write",
        actionKey: "update_row",
        connection: "excel",
        inputs: {
          workbook_id: WORKBOOK_ID,
          worksheet_id: WORKSHEET_ID,
          row_id: String(row.id),
          [KPI_COLUMN]: percent,
        },
      }),
    );

    return { row: row.id, percent, updated: update.data[0] ?? null };
  },
);

export default workflow;
