import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SUBJECT_CRITERIA,
  RECIPIENT_PATTERN,
  DRIVE_FOLDER_ID,
  SHARED_DRIVE_ID,
  PROCESSED_LABEL_ID,
} from "./config.ts";

const sdk = createZapierSdk();

const AttachmentSchema = z
  .object({
    filename: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
  })
  .loose();

const InputSchema = z
  .object({
    id: z.string(),
    subject: z.string().nullable().optional(),
    to: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
    attachments: z.array(AttachmentSchema).nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
  "save-security-report-attachments-to-shared-drive-folder",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const subject = input.subject ?? "";
    const to = input.to ?? "";
    const attachments = input.attachments ?? [];

    if (
      !subject.includes(SUBJECT_CRITERIA) ||
      !to.includes(RECIPIENT_PATTERN)
    ) {
      return {
        skipped: true,
        reason: "subject-or-recipient-did-not-match",
        messageId: input.id,
      };
    }
    if (attachments.length === 0) {
      return { skipped: true, reason: "no-attachments", messageId: input.id };
    }

    const receivedDate = (input.date ?? "").slice(0, 10) || "unknown-date";
    let failed = 0;

    for (const [index, attachment] of attachments.entries()) {
      const filename = attachment.filename ?? `attachment-${index + 1}`;
      try {
        await ctx.step(`upload-attachment-${index}`, async () =>
          sdk.runAction({
            appKey: "google-drive",
            actionType: "write",
            actionKey: "file",
            connection: "google-drive",
            inputs: {
              file: attachment.url,
              drive: SHARED_DRIVE_ID,
              folder: DRIVE_FOLDER_ID,
              new_name: `${receivedDate}_${filename}`,
            },
          }),
        );
      } catch {
        failed += 1;
      }
    }

    if (failed > 0) {
      return {
        messageId: input.id,
        uploaded: attachments.length - failed,
        failed,
        labelled: false,
      };
    }

    await ctx.step("label-message-processed", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "add_label",
        connection: "gmail",
        inputs: { message_id: input.id, new_label_ids: [PROCESSED_LABEL_ID] },
      }),
    );

    return {
      messageId: input.id,
      uploaded: attachments.length,
      failed: 0,
      labelled: true,
    };
  },
);

export default workflow;
