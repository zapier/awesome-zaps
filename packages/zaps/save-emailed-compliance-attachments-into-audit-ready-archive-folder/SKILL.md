---
name: save-emailed-compliance-attachments-into-audit-ready-archive-folder
description: Build a Zapier Next Gen Zap that saves each new email attachment in Outlook into a compliance archive folder in Google Drive, named by email date, sender and subject. Use when a team collects compliance evidence by email and needs it filed in an audit-ready folder without manual uploads.
metadata:
  author: zapier
  summary: "Each attachment emailed to you is saved into your compliance archive folder with a clear, dated file name, so reviewers can find evidence quickly."
  apps: "Microsoft Outlook, Google Drive"
  category: "IT"
  job: "Security compliance"
  source: "https://zapier.com/automations/it/security-compliance/compliance-evidence-collection/save-emailed-compliance-attachments-into-audit-ready-archive-folder"
---

# Save emailed compliance attachments into audit-ready archive folder

## What it does

1. **Trigger:** a new attachment arrives in the connected Outlook inbox (Microsoft Outlook, New Attachment).
2. **Code step:** builds the file name from the email's date, sender and subject plus the original attachment name, with characters that Drive or Windows dislike replaced. If the attachment has no name, the file is named from the date and sender only.
3. **Google Drive** searches the archive folder for a file with that exact name. If one exists, the run stops and uploads nothing.
4. **Google Drive** uploads the attachment to the archive folder under the built name.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Microsoft Outlook, New Attachment (`microsoft-outlook`, `new_attachment`). Leave the shared inbox and folder fields empty to use the connected user's own inbox. The trigger needs the Outlook connection.
2. **Connections** (each alias in the code is the app's slug):
   - `google-drive`: the Google Drive connection for the account that owns the archive folder.
   - `microsoft-outlook`: the Outlook connection for the mailbox whose attachments should be archived. The trigger reads it.
3. **Constants:**
   - `ARCHIVE_FOLDER_ID`: the Google Drive folder ID of the audit-ready archive, the long ID at the end of the folder's URL.
   - `FILENAME_PREFIX`: text added to the start of every file name. Leave it empty for real use.
   - `MAX_FILENAME_LENGTH`: the longest file name written. Defaults to 180.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user the trigger is live.

## Ask the user

- Which Google Drive folder is the audit-ready archive? Give its folder ID for `ARCHIVE_FOLDER_ID`.
- Which mailbox should be watched: the user's own inbox (the default here), or a shared inbox? A shared inbox needs its address in the trigger's Shared Inbox field.
- Should only attachments from a specific folder count? The trigger can be limited to a Parent Folder.

## Test

Before testing, connect a Microsoft Outlook account and a test or integration Google Drive account, and create a test folder named `[install-test] Compliance archive`.

Run a draft test with a sample like this. The Outlook field names are not verified yet, so check them against the trigger's real sample first:

```json
{
  "attachment_name": "vendor-soc2-report.pdf",
  "attachment_url": "https://example.com/vendor-soc2-report.pdf",
  "sender": "auditor@example.com",
  "subject": "Q3 evidence",
  "date": "2026-10-29T09:00:00Z"
}
```

Expected: one file named `2026-10-29 auditor@example.com - Q3 evidence - vendor-soc2-report.pdf` in the test folder. Running the same sample again should upload nothing and return `reason: "duplicate"`.

## Customize

- **Audit log row:** add a spreadsheet or table row for each saved file, for audit logging and indexing.
- **High-risk alert:** send an internal notification when an attachment matches high-risk criteria.

## Notes

- Dedupe works by file name in the archive folder, not by email message ID. Two different emails with the same date, sender, subject and attachment name count as duplicates.
- The email metadata (sender, subject, date) is built into the file name only. The Google Drive upload action has no description field, so it is not stored as file metadata.
- Outlook payload field names (`attachment_name`, `attachment_url`, `sender`, `subject`, `date`) are guesses, not yet checked against a live sample. Match them to the real trigger output before publishing.
- Never commit a real folder ID.
