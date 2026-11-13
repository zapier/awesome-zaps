---
name: save-trademark-search-report-attachments-to-central-folder
description: Build a Zap on Zapier that saves each trademark search report attachment from incoming Gmail emails into one central Google Drive folder, named by date and subject, for legal to review. Use when trademark search report emails arrive in Gmail with attachments and legal wants them in one place. Use for IP or trademark teams that file search reports by hand.
license: MIT
metadata:
  author: zapier
  summary: "Each trademark search report attachment that arrives by email is saved to one central Drive folder, named with its date and subject, so legal can review it in one place."
  apps: "Gmail, Google Drive"
  category: "Legal"
  job: "Intellectual property management"
  source: "https://zapier.com/automations/legal/intellectual-property-management/trademark-management/save-trademark-search-report-attachments-to-central-folder"
---

# Save trademark search report attachments to central folder

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/save-trademark-search-report-attachments-to-central-folder. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new Gmail email matching the search (`gmail`, `search`) arrives. The search is `subject:(trademark search report) has:attachment`, and the trigger returns each message with its attachments.
2. The run stops if the email has no attachments.
3. The email's date becomes `YYYY-MM-DD`, and the subject is cleaned of characters Drive does not allow in file names.
4. **Google Drive** uploads each attachment to the central folder as `<date> <subject> - <original file name>`. Uploads run in parallel, one step per attachment. A failed upload is recorded in the result and does not stop the others.

The Zap only uploads. It never edits, moves or deletes files already in the folder.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting           | What goes there                                                                                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DRIVE_FOLDER_ID` | The central Drive folder, which must already exist: look it up from the folder the user names, with their Google Drive connection. It is the long ID at the end of the folder's URL |

Also review the defaults with them: `SEARCH_QUERY` is the Gmail search that finds the reports (by default, a subject containing "trademark search report" with an attachment). It is copied into the trigger's search keywords, so keep the two in sync.

Also ask which Google account owns the central folder. Its Google Drive connection needs edit access to that folder.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-drive` (the account that owns the central folder, with edit access to it) and `gmail` (the mailbox that receives the reports, for the trigger) to the user's connections.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/search.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's search keywords to the value of `SEARCH_QUERY`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with this sample input. Use a folder the user can throw away.

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

Check that the run returns `uploaded: 1` and `failed: 0`, and that the folder has one new file named `2026-10-29 Trademark search report [test] - report.pdf`. Then run it once more with an input that has no attachments: it should return `skipped: true` and upload nothing. If run-status tools aren't available, check the result in Google Drive directly. The user deletes the test file afterwards, not the agent. Then publish, confirm the trigger is active, and tell the user that nothing runs until a matching email arrives.

## Notes

- The Gmail trigger reads all folders, including sent mail, unless the search says otherwise. Add `in:inbox` to the search to limit it.
- Drive keeps both copies if a file with the same name is already in the folder.
- To extend it: skip mail already filed by storing each message ID in a sheet, create the folder if it is missing, sort uploads into sender-domain subfolders, or label each matched email so reviewers can find it.
- Never commit a real folder ID or email address to a shared copy of `workflow.ts`.
