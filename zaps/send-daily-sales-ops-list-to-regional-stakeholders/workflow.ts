import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

import { FOLDER_ID, WORKSHEET_TITLE, SUBJECT } from "./config.ts";

const sdk = createZapierSdk();

// Ask the user for the stakeholders' email addresses, for the To field.
const RECIPIENTS = ["REPLACE_STAKEHOLDER_EMAIL"];
// Ask the user for the ops owner's email address, for the CC field.
const CC_RECIPIENTS = ["REPLACE_OPS_OWNER_EMAIL"];

const workflow = defineDurable(
  "send-daily-sales-ops-list-to-regional-stakeholders",
  async (ctx) => {
    const found = await ctx.step("find-worksheet-file", async () =>
      sdk.runAction({
        appKey: "google-drive",
        actionType: "search",
        actionKey: "file_v2",
        connection: "google-drive",
        inputs: {
          title: WORKSHEET_TITLE,
          folder: FOLDER_ID,
          search_type: "exact",
        },
      }),
    );

    const file = found.data?.[0] as { webContentLink?: string } | undefined;
    if (!file?.webContentLink) {
      return { skipped: true, reason: "worksheet-not-found" };
    }

    const sent = await ctx.step("send-worksheet-email", async () =>
      sdk.runAction({
        appKey: "microsoft-outlook",
        actionType: "write",
        actionKey: "send_email",
        connection: "microsoft-outlook",
        inputs: {
          recipients: RECIPIENTS,
          ccRecipients: CC_RECIPIENTS,
          subject: SUBJECT,
          body: `Attached: ${WORKSHEET_TITLE}.`,
          bodyFormat: "Text",
          file: file.webContentLink,
        },
      }),
    );

    return { sent: sent.data?.[0] ?? null, file: WORKSHEET_TITLE };
  },
);

export default workflow;
