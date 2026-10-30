import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

const sdk = createZapierSdk();

// Managers who receive the reminder, as email addresses. Replace YOUR_MANAGER_EMAIL with one or more addresses.
const MANAGER_EMAILS = ["YOUR_MANAGER_EMAIL"];
// Subject line of the reminder email.
const SUBJECT = "Performance review booking reminder";
// Body of the reminder email, plain text.
const BODY =
  "Hi managers, it is time to book the performance reviews for your team. Please schedule them in the next two weeks, before the appraisal period starts.";

const workflow = defineDurable<unknown, unknown>(
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
      messageId: sent.data?.[0]?.id ?? null,
    };
  },
);

export default workflow;
