---
name: save-trademark-search-report-attachments-to-central-folder
description: Use when trademark search report emails arrive in Gmail with attachments and legal wants each attachment saved into one central Google Drive folder, named by date and subject, for review. Use for IP or trademark teams that file search reports by hand.
metadata:
  author: zapier
  summary: "Each trademark search report attachment that arrives by email is saved to one central Drive folder, named with its date and subject, so legal can review it in one place."
  apps: "Gmail, Google Drive"
  category: "Legal"
  job: "Intellectual property management"
  source: "https://zapier.com/automations/legal/intellectual-property-management/trademark-management/save-trademark-search-report-attachments-to-central-folder"
---

# Save trademark search report attachments to central folder

## What it does

1. **Trigger:** a new Gmail email matching the search (`subject:(trademark search report) has:attachment`) arrives. Gmail's trigger returns each message with its `attachmentsArray`.
2. The run stops if the email has no attachments.
3. **Formatting** (plain code, with the date conversion in one durable step): the email's date becomes `YYYY-MM-DD`, and the subject is cleaned of characters Drive does not allow in file names.
4. **Google Drive** uploads each attachment to the central folder as `<date> <subject> - <original file name>`. Uploads run in parallel, one step per attachment. A failed upload is recorded in the result and does not stop the others.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Gmail, New Email Matching Search (`gmail`, action `search`). Set its search keywords to the value of `SEARCH_QUERY`, and connect the Gmail account that receives the reports.
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the Gmail connection for the mailbox that receives the reports.
   - `google-drive`: the Google Drive connection for the account that owns the central folder. That account needs edit access to the folder.
3. **Constants:**
   - `SEARCH_QUERY`: the Gmail search string. The code does not read it; it is copied into the trigger's search keywords. Keep the two in sync.
   - `DRIVE_FOLDER_ID`: the long ID at the end of the central folder's URL.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user that nothing runs until a matching email arrives.

## Ask the user

- Which Gmail search finds the trademark search reports? The default matches a subject containing "trademark search report" that has an attachment.
- Which Drive folder is the central folder? Its ID goes in `DRIVE_FOLDER_ID`. The folder must already exist; the workflow does not create it.
- Which Google account owns that folder, and should its connection be the one the Drive step uses?

## Test

Send a test email to the mailbox the trigger watches, with a subject that matches the search (for example `Trademark search report [test]`) and one small PDF attached. Use a folder you can throw away. Then run the workflow on that email's trigger payload. A sample payload:

```json
{
  "message_id": "EXAMPLE_MESSAGE_ID",
  "subject": "Trademark search report [test]",
  "date": "Thu, 29 Oct 2026 10:15:00 +0000",
  "attachmentsArray": [
    {
      "attachment": "https://example.com/files/report.pdf",
      "truncatedFileName": "report.pdf",
      "mime_type": "application/pdf"
    }
  ]
}
```

Check that:

- The run returns `uploaded: 1` and `failed: 0`.
- The folder has one new file named like `2026-10-29 Trademark search report [test] - report.pdf`, with the same content as the attachment.
- An email with no attachment starts no upload (the run returns `skipped: true`).

Delete the test file and the test email afterwards.

## Customize

- **Message-ID duplicates:** skip attachments from a message that was already filed, by storing each message ID in a sheet or table.
- **Create the folder on no match:** if no folder exists with the expected name, create it before uploading.
- **Route into sender-domain subfolders:** put each upload in a subfolder named after the sender's domain.
- **Label the email:** add an inbox label to each matched message so reviewers can find it.

## Notes

- The Gmail trigger reads all folders, including sent mail, unless the search says otherwise. Add `in:inbox` to the search to limit it.
- Drive keeps both copies if a file with the same name is already in the folder.
- Never commit a real folder ID or email address to a shared copy of `workflow.ts`.
