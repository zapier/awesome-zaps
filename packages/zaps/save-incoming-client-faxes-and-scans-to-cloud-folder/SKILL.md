---
name: save-incoming-client-faxes-and-scans-to-cloud-folder
description: Build a Zapier Next Gen Zap that saves each attachment arriving in a scanner or fax label to a secure Google Drive archive folder, with a standardized date-based filename, then labels the email as processed. Use when a legal team receives client faxes or scanner PDFs by email and needs them filed in one cloud folder, searchable by date, without manual uploads.
metadata:
  author: zapier
  summary: "Each fax or scan that lands in the scanner label is saved to your secure cloud folder under a dated, consistent filename and the email is marked processed, so legal staff can find client files fast."
  apps: "Gmail, Google Drive"
  category: "Legal"
  job: "E discovery litigation support"
  source: "https://zapier.com/automations/legal/e-discovery-litigation-support/document-collection-review/save-incoming-client-faxes-and-scans-to-cloud-folder"
---

# Save incoming client faxes and scans to cloud folder

## What it does

1. **Trigger:** a new attachment arrives in the scanner label (Gmail, New Attachment).
2. **Formatter (plain code):** builds a filename from the message date and the original attachment name, for example `2026-10-29_scan-0042.pdf`.
3. **Google Drive:** uploads the attachment to the archive folder under that filename.
4. **Gmail:** adds the processed label to the message so the mailbox stays uncluttered.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Gmail, New Attachment (`gmail` / `attachment`), watching the scanner label through its `label_ids` parameter.
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the work Gmail account (you@example.com) for the trigger and the label step.
   - `google-drive`: a Google Drive connection for the account that owns the archive folder. The only one connected today is personal, so it still needs a work or firm account.
3. **Constants:**
   - `SCANNER_LABEL_ID`: the Gmail label ID the scanner or fax system files into.
   - `PROCESSED_LABEL_ID`: the Gmail label ID to add after a save.
   - `ARCHIVE_FOLDER_ID`: the Google Drive folder ID of the secure archive folder (the long ID in its URL). The folder must already exist.

## Ask the user

- Which Gmail label receives the scanner and fax emails, and which label marks them processed? Create the processed label first if it does not exist.
- Which Google Drive folder is the secure archive? Create it first; the workflow does not create folders.
- Which Google account should own the archive uploads? It must be a work or firm account.

## Test

To test, use a draft test run with a sample payload. Create a test email with a small PDF to the scanner label, and use the `[install-test]` naming for any test folder or label.

```json
{
  "message_id": "<message id of a test email you created>",
  "filename": "scan-test.pdf",
  "message_date": "2026-10-29T10:15:00Z",
  "attachment": "<URL or file of the test PDF>"
}
```

Check that:

- a file named `2026-10-29_scan-test.pdf` appears in the archive folder
- the test email has the processed label
- nothing else in the mailbox or Drive changed

Compare them against a real trigger sample before publishing.

## Customize

- **Add an OCR extraction step before upload** to make PDFs searchable.
- **Route files into client subfolders** using a simple lookup table instead of a flat folder.

## Notes

- The processed step adds a label rather than moving the message out of the inbox.
- Do not commit real label, folder, or account IDs. Keep the placeholders in the copy you share.
