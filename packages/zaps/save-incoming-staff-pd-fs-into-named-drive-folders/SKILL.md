---
name: save-incoming-staff-pd-fs-into-named-drive-folders
description: Build a Zapier Next Gen Zap that saves each incoming staff PDF from Gmail into a Google Drive folder named after the email subject, creating the folder when it doesn't exist. Use when staff send PDFs (forms, timesheets, reviews) by email and the business wants them filed by person or topic without manual uploads.
metadata:
  author: zapier
  summary: "Each PDF a staff member emails you is filed into a Drive folder named after the email's subject, so the documents are easy to find later."
  apps: "Gmail, Google Drive"
  category: "Business Owners"
  job: "Business document management"
  source: "https://zapier.com/automations/business-owners/business-document-management/document-archival-retrieval/save-incoming-staff-pd-fs-into-named-drive-folders"
---

# Save incoming staff PDFs into named Drive folders

## What it does

1. **Trigger:** a new Gmail email that matches `has:attachment filename:pdf` (Gmail, New Email Matching Search).
2. **Folder title:** the email subject, with `Re:` and `Fwd:` prefixes removed, spaces collapsed and each word capitalized.
3. **Filter:** an empty subject stops the run with no action.
4. **Google Drive** (planned, not built): find a folder with that exact title in the configured location, create it if missing, then upload the PDF with its original filename into it.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the draft source. It is not the finished workflow; the Drive steps are still a TODO.

1. **Trigger:** Gmail, New Email Matching Search (`gmail` / `search`). The connection is the Gmail account that receives the staff PDFs.
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the Gmail account that receives the staff PDFs.
   - `google-drive`: the Google Drive account that owns the staff folders. Needed for the unbuilt steps.
3. **Constants:**
   - `GMAIL_QUERY`: the Gmail search. Defaults to `has:attachment filename:pdf`.
   - `GMAIL_CONNECTION`: the Gmail connection alias.
   - Still to add with the Drive steps: the parent folder ID in Drive where the staff folders live (`YOUR_PARENT_FOLDER_ID`).

## Ask the user

- Which Gmail account receives the staff PDFs?
- Which Google Drive folder should hold the staff folders (its ID from the folder URL)?
- Which senders or subject patterns should be accepted? The spec leaves these to configuration; the draft accepts any PDF with a non-empty subject.

## Test

The Google Drive steps are not built and no work-account Drive connection exists, so there is no end-to-end test. A future test should use a sample email with a PDF attachment and the subject `Re: Jane Doe timesheet`, which should yield the folder title `Jane Doe Timesheet`, and then check that the folder exists in Drive and holds the PDF under its original filename.

## Customize

- **Append a date token** to the folder name for month-based organization.
- **Team notification** after each upload to alert records staff or support ops.

## Notes

- Never commit a real spreadsheet, folder or account ID. The constants here are placeholders.
