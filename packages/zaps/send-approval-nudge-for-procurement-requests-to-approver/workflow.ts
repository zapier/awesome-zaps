import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Only requests in this phase get a nudge; anything else is skipped.
const APPROVAL_PHASE = "Awaiting approval";
// Prefix of your procurement system's request page; the record ID is appended.
const RECORD_URL_PREFIX = "https://YOUR_PROCUREMENT_SYSTEM/requests/";

const InputSchema = z
  .object({
    record_id: z.union([z.string(), z.number()]),
    approver_email: z.string(),
    title: z.string().nullable().optional(),
    phase: z.string().nullable().optional(),
    vendor: z.string().nullable().optional(),
    cost_center: z.string().nullable().optional(),
    requester_email: z.string().nullable().optional(),
    summary: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "send-approval-nudge-for-procurement-requests-to-approver",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const recordId = String(input.record_id).trim();

    if (input.phase !== APPROVAL_PHASE) {
      return { skipped: true, reason: "not-in-approval-phase", recordId };
    }

    const approver = await ctx.step("find-approver-in-slack", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "search",
        actionKey: "user_by_email",
        connection: "slack",
        inputs: { email: input.approver_email },
      }),
    );

    const approverId = approver.data[0]?.id;
    if (!approverId) {
      return { skipped: true, reason: "approver-not-found", recordId };
    }

    const lines = [
      `*Approval needed: ${input.title ?? "Procurement request"}*`,
      `Vendor: ${input.vendor ?? "not given"}`,
      `Cost center: ${input.cost_center ?? "not given"}`,
      `Requester: ${input.requester_email ?? "not given"}`,
    ];
    if (input.summary) {
      lines.push(input.summary);
    }
    lines.push(`<${RECORD_URL_PREFIX}${recordId}|Open request ${recordId}>`);

    const message = await ctx.step("send-approval-nudge", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "direct_message",
        connection: "slack",
        inputs: {
          channel: approverId,
          text: lines.join("\n"),
          as_bot: "yes",
          unfurl: "no",
          add_edit_link: "no",
        },
      }),
    );

    return {
      sent: true,
      recordId,
      approverId,
      message: message.data[0] ?? null,
    };
  },
);

export default workflow;
