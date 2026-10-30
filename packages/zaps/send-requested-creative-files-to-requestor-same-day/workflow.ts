import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Sheets spreadsheet ID (the long ID in the sheet's URL).
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID; the first tab is "0".
const WORKSHEET_ID = "0";
// Column with the requestor's email address (the To address).
const REQUESTOR_EMAIL_COLUMN = "COL$A";
// Column with the subject text.
const SUBJECT_COLUMN = "COL$B";
// Column with the message fragments for the body.
const MESSAGE_COLUMN = "COL$C";
// Column with the link to the finished files.
const FILE_LINK_COLUMN = "COL$D";
// Column whose value marks a request as finished.
const STATUS_COLUMN = "COL$E";
// Status value that means the request is completed.
const COMPLETED_VALUE = "Completed";
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

const workflow = defineDurable<unknown, unknown>(
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
