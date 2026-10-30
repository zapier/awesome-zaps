import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

const sdk = createZapierSdk();

// Who receives the reminder: a stakeholder address or a distribution list.
const RECIPIENT = "YOUR_EMAIL_ADDRESS";
// Board meeting name, used in the subject and body.
const MEETING_TITLE = "Board meeting";
// Board meeting date, written the way you want it to read in the email.
const MEETING_DATE = "YOUR_MEETING_DATE";
// Link to the agenda and packet submission page. If empty, no reminder is sent.
const AGENDA_LINK = "YOUR_AGENDA_LINK";

const workflow = defineDurable<unknown, unknown>(
  "send-board-meeting-prep-reminders-to-admin-stakeholders",
  async (ctx) => {
    if (!AGENDA_LINK) {
      return { skipped: true, reason: "no-agenda-link" };
    }

    const subject = `Board meeting prep: ${MEETING_TITLE} on ${MEETING_DATE}`;
    const body = [
      `Reminder: ${MEETING_TITLE} is on ${MEETING_DATE}.`,
      "",
      "Please submit your board packet materials before the meeting.",
      `Agenda and submission link: ${AGENDA_LINK}`,
    ].join("\n");

    const sent = await ctx.step("send-board-prep-email", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: { to: RECIPIENT, subject, body, body_type: "plain" },
      }),
    );

    return {
      sent: true,
      subject,
      recipient: RECIPIENT,
      result: sent.data?.[0] ?? null,
    };
  },
);

export default workflow;
