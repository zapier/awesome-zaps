import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Drive folder ID where receipts land. Also set it as the folder on the trigger.
const INTAKE_FOLDER_ID = "YOUR_INTAKE_FOLDER_ID";
// Google Drive folder ID that originals are moved into after the delay.
const PROCESSED_FOLDER_ID = "YOUR_PROCESSED_FOLDER_ID";
// Email address of the tax provider's upload inbox. Receives each receipt.
const TAX_UPLOAD_ADDRESS = "YOUR_TAX_UPLOAD_EMAIL";
// Sender address. Must be the connected Gmail account.
const SENDER_ADDRESS = "YOUR_SENDER_EMAIL";
// Subject line. {filename} is replaced with the receipt's file name.
const SUBJECT_TEMPLATE = "Receipt: {filename}";
// Body text of the email.
const BODY_TEXT = "Attached is a new receipt for the tax file.";
// Seconds to wait before archiving. 86400 = one day (spec default).
const DELAY_SECONDS = 86400;

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    title: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "send-incoming-receipts-to-tax-provider-and-archive",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const fileId = String(input.id ?? "").trim();
    const fileName = input.title ?? "receipt";
    if (!fileId) {
      return { skipped: true, reason: "no-file-id" };
    }

    const existing = await ctx.step("find-duplicate-in-processed", async () =>
      sdk.runAction({
        appKey: "google-drive",
        actionType: "search",
        actionKey: "file_v2",
        connection: "google-drive",
        inputs: {
          title: fileName,
          folder: PROCESSED_FOLDER_ID,
          search_type: "exact",
        },
      }),
    );
    if (existing.data.length > 0) {
      return { skipped: true, reason: "duplicate-filename", fileName };
    }

    const download = await ctx.step("download-receipt", async () =>
      sdk.runAction({
        appKey: "google-drive",
        actionType: "write",
        actionKey: "ae_461284_google_drive_download_file_custom_action",
        connection: "google-drive",
        inputs: { fileId },
      }),
    );

    const subject = SUBJECT_TEMPLATE.replace("{filename}", fileName);
    await ctx.step("send-receipt-email", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: [TAX_UPLOAD_ADDRESS],
          from: SENDER_ADDRESS,
          subject,
          body: BODY_TEXT,
          file: download.data,
        },
      }),
    );

    await ctx.wait("wait-before-archive", DELAY_SECONDS);

    await ctx.step("move-receipt-to-processed", async () =>
      sdk.runAction({
        appKey: "google-drive",
        actionType: "write",
        actionKey: "move_file",
        connection: "google-drive",
        inputs: {
          file: fileId,
          folder: PROCESSED_FOLDER_ID,
        },
      }),
    );

    return { fileId, fileName, subject };
  },
);

export default workflow;
