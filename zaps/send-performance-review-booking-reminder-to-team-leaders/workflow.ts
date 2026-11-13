import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

import { SUBJECT } from "./config.ts";

const sdk = createZapierSdk();

const MANAGER_EMAILS = ["REPLACE_MANAGER_EMAIL"]; // Ask the user which managers get the reminder, as email addresses. Add one entry per manager.
// Body of the reminder email, plain text.
const BODY =
  "Hi managers, it is time to book the performance reviews for your team. Please schedule them in the next two weeks, before the appraisal period starts.";

const workflow = defineDurable(
  "send-performance-review-booking-reminder-to-team-leaders",
  async (ctx) => {
    const sent = await ctx.step("send-reminder-email", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: MANAGER_EMAILS,
          subject: SUBJECT,
          body: BODY,
          body_type: "plain",
        },
      }),
    );

    return {
      sent: true,
      recipients: MANAGER_EMAILS.length,
      messageId: (sent.data?.[0] as { id?: string } | undefined)?.id ?? null,
    };
  },
);

export default workflow;
