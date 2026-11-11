import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  PROCESSED_FOLDER_ID,
  TAX_UPLOAD_ADDRESS,
  SENDER_ADDRESS,
  SUBJECT_TEMPLATE,
  BODY_TEXT,
} from "@/config";
import googleDrive from "@/connections/google-drive";
import gmail from "@/connections/gmail";

const sdk = createZapierSdk();

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
        connection: googleDrive,
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
        connection: googleDrive,
        inputs: { fileId },
      }),
    );

    const subject = SUBJECT_TEMPLATE.replace("{filename}", fileName);
    await ctx.step("send-receipt-email", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: gmail,
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
        connection: googleDrive,
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
