import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Gmail label ID of the scanner label the trigger watches (for example "Label_1234567890").
const SCANNER_LABEL_ID = "YOUR_SCANNER_LABEL_ID";
// Gmail label ID added to each saved message so the mailbox stays uncluttered.
const PROCESSED_LABEL_ID = "YOUR_PROCESSED_LABEL_ID";
// Google Drive folder ID of the secure archive folder (the long ID in the folder's URL).
const ARCHIVE_FOLDER_ID = "YOUR_ARCHIVE_FOLDER_ID";

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
        connection: "google-drive",
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
        connection: "gmail",
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
