---
name: save-security-report-attachments-to-shared-drive-folder
description: Build a Zapier Next Gen Zap that saves the attachments of matching security report emails to a shared drive folder, dated and named by original filename, then labels the message as processed. Use when security, compliance or audit evidence arrives by email and needs to be filed in a Drive folder without manual downloads.
metadata:
  author: zapier
  summary: "When a security report email arrives, its attachments are saved to your shared drive folder with the received date, and the email is labelled so it is clearly processed."
  apps: "Gmail, Google Drive"
  category: "IT"
  job: "Security compliance"
  source: "https://zapier.com/automations/it/security-compliance/compliance-evidence-collection/save-security-report-attachments-to-shared-drive-folder"
---

# Save security report attachments to shared drive folder

## What it does

1. **Trigger:** a new Gmail email matching a search string arrives.
2. **Filter (in code):** the subject must contain the configured text and the To header must contain the configured recipient. Messages with no attachments stop here.
3. **Google Drive** uploads each attachment to the configured folder, named `<received date>_<original filename>`. A failed upload is counted, and the run continues with the next attachment.
4. **Gmail** adds the processed label to the message, but only if every upload succeeded. Otherwise the message is left unlabelled so the next run can retry it.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Gmail, New Email Matching Search (`gmail` / `search`). Its `query` param is `SEARCH_QUERY`.
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the Gmail account that receives the reports.
   - `google-drive`: the Google account that owns the destination folder. Bind this before publishing; the workflow cannot upload without it.
3. **Constants:**
   - `SEARCH_QUERY`: the Gmail search that picks up report emails, in Gmail search syntax.
   - `SUBJECT_CRITERIA`: text the subject must contain.
   - `RECIPIENT_PATTERN`: text the To header must contain, such as the receiving mailbox.
   - `DRIVE_FOLDER_ID`: the folder ID from the folder's URL.
   - `SHARED_DRIVE_ID`: the shared drive ID, or leave it empty to use My Drive.
   - `PROCESSED_LABEL_ID`: the Gmail label ID to add to processed messages.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user the trigger is live.

## Ask the user

- Which Gmail search finds the report emails? Give the search string in Gmail syntax.
- What text must the subject contain, and which recipient address must the email be sent to?
- Which Drive folder should receive the files: its ID, and is it in a shared drive (if so, which)?
- Which Gmail label marks processed messages? The label must already exist.
- The folder must already exist. The workflow does not create it.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. It does not match the filter, so it writes nothing:

```json
{
  "id": "example-message-id",
  "subject": "Lunch plans",
  "to": "you@example.com",
  "date": "2026-10-29T10:00:00Z",
  "attachments": []
}
```

Confirm the run completes with `reason: "subject-or-recipient-did-not-match"` and that no file was added to the folder and no label was added. Then run a second sample against a test email you control: send it to your own address, with the subject text and one attachment, and give the attachment's `url`. Check that the file appears in the folder with the date-prefixed name and that the message gets the processed label. Delete the test file and label afterwards.

## Customize

- **Log uploads** to a tracking sheet or ticketing system for auditability.
- **Name files by source email and timestamp** for easier search.

## Notes

- Gmail trigger payload field names for attachments (`url`, `filename`) were assumed, because the sample read returned no records. Check them on the first real run.
- Drive allows duplicate file names, so a second report with the same name and date creates a second file rather than overwriting.
- A message with several attachments is processed as one run. If any upload fails, the message stays unlabelled and the next matching run tries again, which can re-upload the attachments that already succeeded.
- Never commit a real folder ID, label ID, or email address.
