import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SPREADSHEET_ID,
  WORKSHEET_ID,
  REQUESTOR_EMAIL_COLUMN,
  SUBJECT_COLUMN,
  MESSAGE_COLUMN,
  FILE_LINK_COLUMN,
  STATUS_COLUMN,
  COMPLETED_VALUE,
} from "./config.ts";

const sdk = createZapierSdk();

// Design owners to CC on each delivery.
const CC_ADDRESSES = ["YOUR_DESIGN_OWNER_EMAIL"];

const InputSchema = z
  .object({
    COL$A: z.string().nullable().optional(),
    COL$B: z.string().nullable().optional(),
    COL$C: z.string().nullable().optional(),
    COL$D: z.string().nullable().optional(),
    COL$E: z.string().nullable().optional(),
    row: z.number().nullable().optional(),
    id: z.number().nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
  "send-requested-creative-files-to-requestor-same-day",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const status = (input[STATUS_COLUMN] ?? "").trim();
    if (status !== COMPLETED_VALUE) {
      return { skipped: true, reason: "status-not-completed", status };
    }

    const to = (input[REQUESTOR_EMAIL_COLUMN] ?? "").trim();
    if (!to) {
      return {
        skipped: true,
        reason: "no-requestor-email",
        row: input.row ?? null,
      };
    }

    const subject = input[SUBJECT_COLUMN] ?? "";
    const body = [
      input[MESSAGE_COLUMN] ?? "",
      "",
      `Files: ${input[FILE_LINK_COLUMN] ?? ""}`,
    ].join("\n");

    const sent = await ctx.step("send-handoff-email", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: [to],
          cc: CC_ADDRESSES,
          subject,
          body,
          body_type: "plain",
        },
      }),
    );

    return {
      sent: true,
      to,
      cc: CC_ADDRESSES,
      subject,
      spreadsheet: SPREADSHEET_ID,
      worksheet: WORKSHEET_ID,
      result: sent.data?.[0] ?? null,
    };
  },
);

export default workflow;
