import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

const sdk = createZapierSdk();

// Google Drive folder ID that holds the worksheet (the long ID in the folder's URL).
const FOLDER_ID = "YOUR_FOLDER_ID";
// Exact title of the worksheet file to send each weekday.
const WORKSHEET_TITLE = "YOUR_WORKSHEET_TITLE";
// Stakeholder email addresses for the To field.
const RECIPIENTS = ["YOUR_STAKEHOLDER_EMAIL"];
// Ops owner email address for the CC field.
const CC_RECIPIENTS = ["YOUR_OPS_OWNER_EMAIL"];
// Subject line for the email.
const SUBJECT = "Daily sales ops list";

const workflow = defineDurable<unknown, unknown>(
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
