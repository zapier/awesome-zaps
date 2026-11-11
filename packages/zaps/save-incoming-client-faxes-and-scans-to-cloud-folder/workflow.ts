import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { PROCESSED_LABEL_ID, ARCHIVE_FOLDER_ID } from "@/config";
import googleDrive from "@/connections/google-drive";
import gmail from "@/connections/gmail";

const sdk = createZapierSdk();

const InputSchema = z
  .object({
    message_id: z.string(),
    filename: z.string(),
    message_date: z.string().nullable().optional(),
    attachment: z.unknown(),
  })
  .loose();

// Filename = message date (YYYY-MM-DD) + original attachment name, with unsafe characters replaced.
function buildFilename(
  messageDate: string | null | undefined,
  original: string,
): string {
  const parsed = messageDate ? new Date(messageDate) : null;
  const stamp =
    parsed && !Number.isNaN(parsed.getTime())
      ? parsed.toISOString().slice(0, 10)
      : "undated";
  return `${stamp}_${original.replace(/[^A-Za-z0-9._-]+/g, "_")}`;
}

const workflow = defineDurable<unknown, unknown>(
  "save-incoming-client-faxes-and-scans-to-cloud-folder",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const filename = buildFilename(input.message_date, input.filename);

    const upload = await ctx.step("upload-attachment-to-drive", async () =>
      sdk.runAction({
        appKey: "google-drive",
        actionType: "write",
        actionKey: "file",
        connection: googleDrive,
        inputs: {
          file: input.attachment,
          folder: ARCHIVE_FOLDER_ID,
          new_name: filename,
        },
      }),
    );

    const labeled = await ctx.step("add-processed-label", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "add_label",
        connection: gmail,
        inputs: {
          message_id: input.message_id,
          new_label_ids: [PROCESSED_LABEL_ID],
        },
      }),
    );

    return {
      filename,
      uploaded: upload.data[0] ?? null,
      labeled: labeled.data[0] ?? null,
    };
  },
);

export default workflow;
