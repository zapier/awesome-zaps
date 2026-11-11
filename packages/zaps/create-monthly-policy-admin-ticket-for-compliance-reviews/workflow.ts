import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

import {
  TICKET_SUBJECT_PREFIX,
  TICKET_TYPE,
  SUPPORT_QUEUE_GROUP_ID,
  AUDIT_TAG,
} from "@/config";
import zendesk from "@/connections/zendesk";

const sdk = createZapierSdk();

// Internal note added to each ticket for the audit trail (not shown to the requester).
const AUDIT_NOTE =
  "Created automatically by the monthly policy admin review schedule.";

const workflow = defineDurable<unknown, unknown>(
  "create-monthly-policy-admin-ticket-for-compliance-reviews",
  async (ctx) => {
    const runMonth = await ctx.step("capture-run-month", async () =>
      new Date().toISOString().slice(0, 7),
    );

    const subject = `${TICKET_SUBJECT_PREFIX} ${runMonth}`;

    const ticket = await ctx.step("create-zendesk-ticket", async () =>
      sdk.runAction({
        appKey: "zendesk",
        actionType: "write",
        actionKey: "ticket",
        connection: zendesk,
        inputs: {
          subject,
          first_comment: `Monthly policy report review for ${runMonth}. Confirm distribution and record the outcome on this ticket.`,
          type: TICKET_TYPE,
          external_id: `compliance-review-${runMonth}`,
        },
      }),
    );

    const createdTicket = ticket.data[0] as
      { id?: number | string } | undefined;
    if (!createdTicket?.id) {
      return { created: false, reason: "zendesk-ticket-id-missing", runMonth };
    }

    const assigned = await ctx.step("assign-zendesk-ticket", async () =>
      sdk.runAction({
        appKey: "zendesk",
        actionType: "write",
        actionKey: "update_ticket_v2",
        connection: zendesk,
        inputs: {
          ticket: String(createdTicket.id),
          group_id: Number(SUPPORT_QUEUE_GROUP_ID),
          additional_tags: AUDIT_TAG,
          comment: AUDIT_NOTE,
          comment_public: false,
        },
      }),
    );

    return {
      created: true,
      runMonth,
      ticketId: createdTicket.id,
      assigned: assigned.data[0] ?? null,
    };
  },
);

export default workflow;
