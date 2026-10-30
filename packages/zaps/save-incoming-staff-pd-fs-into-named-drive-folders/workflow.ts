import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Gmail search that fires the workflow; matches incoming mail with a PDF attachment.
const GMAIL_QUERY = "has:attachment filename:pdf";
// Gmail connection alias; bind it to the Gmail account that receives the staff PDFs.
const GMAIL_CONNECTION = "gmail";

const InputSchema = z.object({}).loose();

// Subject -> folder title: strip reply/forward prefixes, collapse spaces, capitalize each word.
function folderTitleFromSubject(subject: string): string {
  return subject
    .replace(/^((re|fwd?):\s*)+/i, "")
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) =>
      word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word,
    )
    .join(" ");
}

const workflow = defineDurable<unknown, unknown>(
  "save-incoming-staff-pd-fs-into-named-drive-folders",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const subject = typeof input.subject === "string" ? input.subject : "";

    const folderTitle = folderTitleFromSubject(subject);
    if (!folderTitle) {
      return { skipped: true, reason: "empty-subject" };
    }

    // TODO(not built): Google Drive find-or-create folder and upload-file steps.
    // No Google Drive connection on the work account; the only connected Drive account is personal and was not used.
    return { folderTitle, uploaded: false, reason: "drive-steps-not-built" };
  },
);

export default workflow;
