---
name: save-emailed-compliance-attachments-into-audit-ready-archive-folder
description: Build a Zap on Zapier that saves each new email attachment in Outlook into a compliance archive folder in Google Drive, named by email date, sender and subject. Use when a team collects compliance evidence by email and needs it filed in an audit-ready folder without manual uploads.
license: MIT
metadata:
  author: zapier
  summary: "Each attachment emailed to you is saved into your compliance archive folder with a clear, dated file name, so reviewers can find evidence quickly."
  apps: "Microsoft Outlook, Google Drive"
  category: "IT"
  job: "Security compliance"
  source: "https://zapier.com/automations/it/security-compliance/compliance-evidence-collection/save-emailed-compliance-attachments-into-audit-ready-archive-folder"
---

# Save emailed compliance attachments into audit-ready archive folder

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/save-emailed-compliance-attachments-into-audit-ready-archive-folder. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new attachment arrives in the connected Outlook inbox (`microsoft-outlook`, `new_attachment`).
2. **Code step:** builds the file name from the email's date, sender and subject plus the original attachment name, with characters that Drive or Windows dislike replaced. If the attachment has no name, the file is named from the date and sender only.
3. **Google Drive** searches the archive folder for a file with that exact name. If one exists, the run stops and uploads nothing.
4. **Google Drive** uploads the attachment to the archive folder under the built name.

The Zap never overwrites or deletes a file already in the archive.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                     | What goes there                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `REPLACE_ARCHIVE_FOLDER_ID` | The Google Drive folder that is the audit-ready archive. Its ID is the long ID at the end of the folder's URL |

Review these defaults with them: keep `FILENAME_PREFIX` in `config.ts` empty for real use, and `MAX_FILENAME_LENGTH` in `workflow.ts` (180) unless a reviewer needs shorter names.

Also ask:

- Which mailbox should be watched: the user's own inbox (the default, with the trigger's shared inbox field left empty), or a shared inbox? A shared inbox needs its address in the trigger's Shared Inbox field.
- Should only attachments from one folder count? The trigger can be limited to a Parent Folder.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-drive` to the user's Google Drive connection for the account that owns the archive folder, and `microsoft-outlook` to the Outlook connection for the mailbox whose attachments should be archived. The trigger reads `microsoft-outlook`. No other app needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-attachment.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Before testing, connect a Microsoft Outlook account and a test or integration Google Drive account, and create a test folder named `[install-test] Compliance archive`. Point the archive folder at that test folder for the draft run.

Run a draft test with a sample like this:

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

If run-status tools aren't available, check the test folder in Google Drive directly. Then publish, confirm the trigger is active, and tell the user the Zap is live. Ask the user to delete the test file and the test folder; the agent doesn't delete them.

## Notes

- Dedupe works by file name in the archive folder, not by email message ID. Two different emails with the same date, sender, subject and attachment name count as duplicates.
- The email metadata (sender, subject, date) is only in the file name. The Google Drive upload action has no description field, so it isn't stored as file metadata.
- The Outlook payload field names (`attachment_name`, `attachment_url`, `sender`, `subject`, `date`) are not yet checked against a live sample. Match them to the trigger's real output before publishing.
- To extend it: add a spreadsheet or table row for each saved file as an audit log, or send an internal alert when an attachment matches high-risk criteria.
