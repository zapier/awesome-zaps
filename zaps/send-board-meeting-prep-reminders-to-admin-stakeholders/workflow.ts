import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

import {
  RECIPIENT,
  MEETING_TITLE,
  MEETING_DATE,
  AGENDA_LINK,
} from "./config.ts";

const sdk = createZapierSdk();

const workflow = defineDurable(
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
