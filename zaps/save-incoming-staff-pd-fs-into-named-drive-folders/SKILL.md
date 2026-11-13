---
name: save-incoming-staff-pd-fs-into-named-drive-folders
description: Build a Zap on Zapier that saves each incoming staff PDF from Gmail into a Google Drive folder named after the email subject, creating the folder when it doesn't exist. Use when staff send PDFs (forms, timesheets, reviews) by email and the business wants them filed by person or topic without manual uploads.
license: MIT
metadata:
  author: zapier
  summary: "Each PDF a staff member emails you is filed into a Drive folder named after the email's subject, so the documents are easy to find later."
  apps: "Gmail, Google Drive"
  category: "Business Owners"
  job: "Business document management"
  source: "https://zapier.com/automations/business-owners/business-document-management/document-archival-retrieval/save-incoming-staff-pd-fs-into-named-drive-folders"
---

# Save incoming staff PDFs into named Drive folders

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/save-incoming-staff-pd-fs-into-named-drive-folders. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new Gmail email that matches `has:attachment filename:pdf` (`gmail`, `search`, New Email Matching Search). The trigger brings the email's subject.
2. **Folder title:** the subject, with `Re:` and `Fwd:` prefixes removed, spaces collapsed and each word capitalized. An empty subject stops the run with nothing done.
3. **Google Drive** (not built yet in `workflow.ts`): find a folder with that exact title in the chosen Drive location, create it if missing, then upload the PDF under its original filename into it.

## Ask the user

This zap has no `REPLACE_…` values to fill in. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

Review these defaults with them:

- `GMAIL_QUERY` in `config.ts`: `has:attachment filename:pdf`. It matches every PDF from any sender, so narrow it if only some staff should be filed.
- `GMAIL_CONNECTION` in `config.ts`: `gmail`, the alias for the Gmail account.

Ask these before building:

- Which Gmail account receives the staff PDFs?
- Which Google Drive folder holds the staff folders? Look it up by name with the user's Drive connection.
- Which senders or subject patterns should be accepted? The draft accepts any PDF with a non-empty subject.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` to the user's Gmail connection for the account that receives the staff PDFs. The Google Drive steps will need a Google Drive connection for the account that owns the staff folders once they are built.
2. **Source:** publish `workflow.ts` and `config.ts`. `triggers/search.ts` and `connections/` are settings, not code: set the trigger's search to `GMAIL_QUERY` and its connection to `gmail`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a sample email: one with a PDF attachment and the subject `Re: Jane Doe timesheet`.

```json
{
  "subject": "Re: Jane Doe timesheet"
}
```

Check that the run returns the folder title `Jane Doe Timesheet`. Once the Google Drive steps are built, also check that the folder exists in Drive and holds the PDF under its original filename. If run-status tools aren't available, check the result in Google Drive directly. Then publish, confirm the trigger is active, and ask the user to delete the test folder. The agent doesn't delete test data.

## Notes

- To limit which staff are filed, narrow `GMAIL_QUERY` by sender or subject.
- To file into month-based folders, append a date token to the folder name.
- To alert records staff or support ops after each upload, add a team notification step.
- Never commit a real spreadsheet, folder or account ID. The constants here are placeholders.
