import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

const sdk = createZapierSdk();

// Subject prefix for each ticket; the run month (YYYY-MM) is added after it.
const TICKET_SUBJECT_PREFIX = "Monthly policy admin review";
// Zendesk ticket type for the policy/admin queue: problem, incident, question or task.
const TICKET_TYPE = "task";
// Zendesk group ID of the policy support queue (the numeric ID from Zendesk, as a string).
const SUPPORT_QUEUE_GROUP_ID = "YOUR_ZENDESK_GROUP_ID";
// Tag added to each ticket so the monthly tickets can be found for the audit trail.
const AUDIT_TAG = "compliance-monthly-review";
// Internal note added to each ticket for the audit trail (not shown to the requester).
const AUDIT_NOTE =
  "Created automatically by the monthly policy admin review schedule.";
// Zendesk connection alias (the app key).
const ZENDESK_CONNECTION = "zendesk";

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
        connection: ZENDESK_CONNECTION,
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
        connection: ZENDESK_CONNECTION,
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
