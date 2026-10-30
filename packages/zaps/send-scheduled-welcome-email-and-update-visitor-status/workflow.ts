import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables table to watch (the Table ID from the table's URL).
const TABLE_ID = "YOUR_TABLE_ID";
// Column keys in the table, in the order the columns were added: f1 is the first column.
const EMAIL_FIELD = "f1";
const NAME_FIELD = "f2";
const MILESTONE_FIELD = "f3";
const STAGE_FIELD = "f4";
const SENT_AT_FIELD = "f5";
// Milestone value that starts the welcome sequence.
const MILESTONE_VALUE = "Signed up";
// Stage the record moves to after the welcome email is sent.
const NEXT_STAGE = "Welcome sent";
// Seconds to wait after the milestone before sending. Minimum 1, which sends right away. Set a longer wait for a send window (for example 86400 for the next day).
const SEND_DELAY_SECONDS = 1;
// Email subject. {name} is replaced with the record's name.
const EMAIL_SUBJECT = "Welcome, {name}!";
// Email body (HTML). {name} is replaced with the record's name.
const EMAIL_BODY =
  "<p>Hi {name},</p><p>Welcome aboard. We're glad you're here.</p>";
// Sender name shown in the email.
const FROM_NAME = "Customer Success";

const InputSchema = z
  .object({
    record_id: z.string().nullable().optional(),
    new: z
      .object({
        id: z.string().nullable().optional(),
        data: z.record(z.string(), z.unknown()).nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "send-scheduled-welcome-email-and-update-visitor-status",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const recordId = String(input.record_id ?? input.new?.id ?? "");
    const data = input.new?.data ?? {};
    const field = (key: string) => String(data[key] ?? "").trim();

    const email = field(EMAIL_FIELD);
    const name = field(NAME_FIELD);
    const milestone = field(MILESTONE_FIELD);
    const stage = field(STAGE_FIELD);
    const alreadySentAt = field(SENT_AT_FIELD);

    if (milestone !== MILESTONE_VALUE) {
      return { skipped: true, reason: "milestone-not-reached", recordId };
    }
    if (alreadySentAt || stage === NEXT_STAGE) {
      return { skipped: true, reason: "already-sent", recordId };
    }
    if (!email) {
      return { skipped: true, reason: "no-email", recordId };
    }

    if (SEND_DELAY_SECONDS > 0) {
      await ctx.wait("wait-for-send-window", SEND_DELAY_SECONDS);
    }

    await ctx.step("send-welcome-email", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: email,
          subject: EMAIL_SUBJECT.replace("{name}", name),
          body: EMAIL_BODY.replace("{name}", name),
          body_type: "html",
          from_name: FROM_NAME,
        },
      }),
    );

    const sentAt = await ctx.step("capture-sent-at", async () =>
      new Date().toISOString(),
    );

    const update = await ctx.step("update-visitor-stage", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "update_record",
        connection: "zapier-tables",
        inputs: {
          table_id: TABLE_ID,
          record_id: recordId,
          [`new__data__${STAGE_FIELD}`]: NEXT_STAGE,
          [`new__data__${SENT_AT_FIELD}`]: sentAt,
        },
      }),
    );

    return {
      recordId,
      sentTo: email,
      stage: NEXT_STAGE,
      sentAt,
      updated: update.data?.[0] ?? null,
    };
  },
);

export default workflow;
