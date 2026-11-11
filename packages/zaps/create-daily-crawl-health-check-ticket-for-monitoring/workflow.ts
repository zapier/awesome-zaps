import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

import {
  REQUESTER_NAME,
  REQUESTER_EMAIL,
  TICKET_PRIORITY,
  TICKET_TYPE,
  TICKET_TAGS,
  FIRST_COMMENT_PUBLIC,
} from "@/config";
import zendesk from "@/connections/zendesk";

const sdk = createZapierSdk();

// Numeric Zendesk group ID of the monitoring team; replace 0 with your group's ID.
const MONITORING_GROUP_ID = 0;
// Items in the templated checklist that becomes the ticket body.
const CHECKLIST_ITEMS = [
  "Review crawl errors and failed URLs",
  "Check crawl coverage against the expected page count",
  "Review newly blocked or redirected URLs",
  "Close this ticket or note the follow-up",
];

const workflow = defineDurable<unknown, unknown>(
  "create-daily-crawl-health-check-ticket-for-monitoring",
  async (ctx) => {
    const runAt = await ctx.step("capture-run-at", async () =>
      new Date().toISOString(),
    );

    const subject = `Daily crawl health check: ${runAt.slice(0, 10)}`;
    const checklist = [
      `Crawl health check run: ${runAt}`,
      "",
      ...CHECKLIST_ITEMS.map((item) => `- [ ] ${item}`),
    ].join("\n");

    const ticket = await ctx.step("create-crawl-health-ticket", async () =>
      sdk.runAction({
        appKey: "zendesk",
        actionType: "write",
        actionKey: "ticket",
        connection: zendesk,
        inputs: {
          subject,
          first_comment: checklist,
          comment_format: "Plain Text",
          first_comment_public: FIRST_COMMENT_PUBLIC,
          name: REQUESTER_NAME,
          email: REQUESTER_EMAIL,
          group_id: MONITORING_GROUP_ID,
          priority: TICKET_PRIORITY,
          type: TICKET_TYPE,
          tags: TICKET_TAGS,
        },
      }),
    );

    return { runAt, subject, ticket: ticket.data?.[0] ?? null };
  },
);

export default workflow;
