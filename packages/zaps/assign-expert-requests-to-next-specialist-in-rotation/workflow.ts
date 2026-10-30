import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables ID of the expert rotation table. Columns: f1 Name, f2 Email,
// f3 Next (checkbox), f4 Assigned count (number), f5 Rotation order (number), f6 Gmail label ID.
const ROTATION_TABLE_ID = "YOUR_ROTATION_TABLE_ID";
// Address that receives the request when no record in the table is marked Next.
const FALLBACK_EMAIL = "YOUR_FALLBACK_EMAIL";
// Hidden marker written into each reply, so a request that was already routed is skipped.
const PROCESSED_MARKER = "rotation-routed";

const FIELD = {
  email: "f2",
  next: "f3",
  count: "f4",
  order: "f5",
  labelId: "f6",
} as const;

const InputSchema = z
  .object({
    message_id: z.string(),
    thread_id: z.string(),
    subject: z.string().nullable().optional(),
    from: z
      .object({ email: z.string().nullable().optional() })
      .loose()
      .nullable()
      .optional(),
    body_plain: z.string().nullable().optional(),
  })
  .loose();

type Row = {
  record_id: string;
  old?: { data?: Record<string, string | number | boolean | null> };
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const workflow = defineDurable<unknown, unknown>(
  "assign-expert-requests-to-next-specialist-in-rotation",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const subject = input.subject ?? "";
    const sender = input.from?.email ?? "";
    const body = input.body_plain ?? "";

    if (/^\s*re:/i.test(subject)) {
      return { skipped: true, reason: "reply-thread" };
    }
    if (/no-?reply|billing|invoice|receipt/i.test(`${sender} ${subject}`)) {
      return { skipped: true, reason: "automated-notice" };
    }
    if (body.includes(PROCESSED_MARKER)) {
      return { skipped: true, reason: "already-routed" };
    }

    const findByField = (fieldKey: string, lookupValue: string | boolean) =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "search",
        actionKey: "find_record",
        inputs: {
          table_id: ROTATION_TABLE_ID,
          filter_count: "1",
          use_stored_order: false,
          field_data_key: fieldKey,
          operator: "exact",
          lookup_value: lookupValue,
        },
      });

    const next = await ctx.step("find-next-expert", async () =>
      findByField(FIELD.next, true),
    );

    const assignee = next.data[0] as Row | undefined;
    const fields = assignee?.old?.data ?? {};
    const recipient = String(fields[FIELD.email] || FALLBACK_EMAIL);
    const labelId = fields[FIELD.labelId];

    if (assignee && labelId) {
      await ctx.step("label-routed-message", async () =>
        sdk.runAction({
          appKey: "gmail",
          actionType: "write",
          actionKey: "add_label",
          connection: "gmail",
          inputs: { message_id: input.message_id, new_label_ids: [labelId] },
        }),
      );
    }

    const replyHtml = `<p>${escapeHtml(body).replace(/\r?\n/g, "<br>")}</p><div style="display:none">${PROCESSED_MARKER}</div>`;

    await ctx.step("reply-to-expert", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "reply_to_message",
        connection: "gmail",
        inputs: {
          thread_id: input.thread_id,
          to: [recipient],
          body: replyHtml,
          body_type: "html",
        },
      }),
    );

    if (!assignee) {
      return { routedTo: recipient, rotation: "no-next-record" };
    }

    const count = Number(fields[FIELD.count] ?? 0);
    const order = Number(fields[FIELD.order] ?? 0);

    await ctx.step("update-assignee-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "update_record",
        inputs: {
          table_id: ROTATION_TABLE_ID,
          record_id: assignee.record_id,
          new__data__f3: false,
          new__data__f4: String(count + 1),
        },
      }),
    );

    let following = await ctx.step("find-following-expert", async () =>
      findByField(FIELD.order, String(order + 1)),
    );
    if (!following.data[0]) {
      following = await ctx.step("find-first-expert", async () =>
        findByField(FIELD.order, "1"),
      );
    }
    const followingRecord = following.data[0] as Row | undefined;

    if (followingRecord) {
      await ctx.step("set-next-expert", async () =>
        sdk.runAction({
          appKey: "zapier-tables",
          actionType: "write",
          actionKey: "update_record",
          inputs: {
            table_id: ROTATION_TABLE_ID,
            record_id: followingRecord.record_id,
            new__data__f3: true,
          },
        }),
      );
    }

    return {
      routedTo: recipient,
      assigneeRecordId: assignee.record_id,
      nextRecordId: followingRecord?.record_id ?? null,
    };
  },
);

export default workflow;
