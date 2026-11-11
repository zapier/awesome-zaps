import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

import { FOLDER_ID, WORKSHEET_TITLE, SUBJECT } from "@/config";
import googleDrive from "@/connections/google-drive";
import microsoftOutlook from "@/connections/microsoft-outlook";

const sdk = createZapierSdk();

// Stakeholder email addresses for the To field.
const RECIPIENTS = ["YOUR_STAKEHOLDER_EMAIL"];
// Ops owner email address for the CC field.
const CC_RECIPIENTS = ["YOUR_OPS_OWNER_EMAIL"];

const workflow = defineDurable<unknown, unknown>(
  "send-daily-sales-ops-list-to-regional-stakeholders",
  async (ctx) => {
    const found = await ctx.step("find-worksheet-file", async () =>
      sdk.runAction({
        appKey: "google-drive",
        actionType: "search",
        actionKey: "file_v2",
        connection: googleDrive,
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
        connection: microsoftOutlook,
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
