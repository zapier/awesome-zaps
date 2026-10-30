import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Drive folder ID of the audit-ready archive folder (the long ID at the end of the folder's URL).
const ARCHIVE_FOLDER_ID = "YOUR_ARCHIVE_FOLDER_ID";
// Text added to the start of every saved file name. Leave empty for real use.
const FILENAME_PREFIX = "";
// Longest file name written, in characters.
const MAX_FILENAME_LENGTH = 180;

const InputSchema = z
  .object({
    attachment_name: z.string().nullable().optional(),
    attachment_url: z.string().nullable().optional(),
    sender: z.string().nullable().optional(),
    subject: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
  })
  .loose();

function cleanName(value: string): string {
  return value
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function buildFileName(input: z.infer<typeof InputSchema>): string {
  const date = (input.date ?? "undated").slice(0, 10);
  const sender = cleanName(input.sender ?? "unknown sender");
  if (!input.attachment_name) {
    return `${FILENAME_PREFIX}${date} ${sender}`.slice(0, MAX_FILENAME_LENGTH);
  }
  const subject = cleanName(input.subject ?? "no subject");
  const original = cleanName(input.attachment_name);
  return `${FILENAME_PREFIX}${date} ${sender} - ${subject} - ${original}`.slice(
    0,
    MAX_FILENAME_LENGTH,
  );
}

const workflow = defineDurable<unknown, unknown>(
  "save-emailed-compliance-attachments-into-audit-ready-archive-folder",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    if (!input.attachment_url) {
      return { skipped: true, reason: "no-attachment" };
    }

    const fileName = buildFileName(input);

    const existing = await ctx.step("find-existing-archive-file", async () =>
      sdk.runAction({
        appKey: "google-drive",
        actionType: "search",
        actionKey: "file_v2",
        connection: "google-drive",
        inputs: {
          title: fileName,
          folder: ARCHIVE_FOLDER_ID,
          search_type: "exact",
        },
      }),
    );
    if (existing.data.length > 0) {
      return { skipped: true, reason: "duplicate", fileName };
    }

    const upload = await ctx.step("upload-attachment-to-archive", async () =>
      sdk.runAction({
        appKey: "google-drive",
        actionType: "write",
        actionKey: "file",
        connection: "google-drive",
        inputs: {
          file: input.attachment_url,
          folder: ARCHIVE_FOLDER_ID,
          new_name: fileName,
        },
      }),
    );

    return { fileName, uploaded: upload.data[0] ?? null };
  },
);

export default workflow;
