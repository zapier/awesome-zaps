import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Gmail search for the trigger, in the same syntax as the Gmail search box. Enter it in the trigger's "Search keywords" field.
const SEARCH_QUERY = "subject:(trademark search report) has:attachment";
// Google Drive folder ID to save into (the long ID at the end of the folder's URL).
const DRIVE_FOLDER_ID = "YOUR_DRIVE_FOLDER_ID";

const InputSchema = z
  .object({
    message_id: z.string().nullable().optional(),
    subject: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
    attachmentsArray: z
      .array(
        z
          .object({
            attachment: z.string(),
            truncatedFileName: z.string().nullable().optional(),
            mime_type: z.string().nullable().optional(),
          })
          .loose(),
      )
      .nullable()
      .optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "save-trademark-search-report-attachments-to-central-folder",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const attachments = input.attachmentsArray ?? [];
    if (attachments.length === 0) {
      return {
        skipped: true,
        reason: "no-attachments",
        messageId: input.message_id ?? null,
      };
    }

    const datePart = await ctx.step("format-sent-date", async () => {
      const sent = new Date(input.date ?? "");
      return Number.isNaN(sent.getTime())
        ? "undated"
        : sent.toISOString().slice(0, 10);
    });
    const subject = (input.subject ?? "no subject")
      .replace(/[\\/:*?"<>|]/g, "-")
      .trim()
      .slice(0, 100);

    const results = await Promise.all(
      attachments.map((attachment, index) => {
        const fileName = `${datePart} ${subject} - ${attachment.truncatedFileName ?? "attachment"}`;
        return ctx.step(`upload-attachment-${index}`, async () => {
          try {
            const upload = await sdk.runAction({
              appKey: "google-drive",
              actionType: "write",
              actionKey: "file",
              connection: "google-drive",
              inputs: {
                file: attachment.attachment,
                folder: DRIVE_FOLDER_ID,
                new_name: fileName,
              },
            });
            return {
              ok: true,
              name: fileName,
              id: upload.data?.[0]?.id ?? null,
            };
          } catch (error) {
            return { ok: false, name: fileName, error: String(error) };
          }
        });
      }),
    );

    const failed = results.filter((result) => !result.ok).length;
    return {
      messageId: input.message_id ?? null,
      uploaded: results.length - failed,
      failed,
      results,
    };
  },
);

export default workflow;
