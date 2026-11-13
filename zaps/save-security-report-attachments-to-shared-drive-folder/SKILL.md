---
name: save-security-report-attachments-to-shared-drive-folder
description: Build a Zap on Zapier that saves the attachments of matching security report emails to a shared drive folder, dated and named by original filename, then labels the message as processed. Use when security, compliance or audit evidence arrives by email and needs to be filed in a Drive folder without manual downloads.
license: MIT
metadata:
  author: zapier
  summary: "When a security report email arrives, its attachments are saved to your shared drive folder with the received date, and the email is labelled so it is clearly processed."
  apps: "Gmail, Google Drive"
  category: "IT"
  job: "Security compliance"
  source: "https://zapier.com/automations/it/security-compliance/compliance-evidence-collection/save-security-report-attachments-to-shared-drive-folder"
---

# Save security report attachments to shared drive folder

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/save-security-report-attachments-to-shared-drive-folder. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new Gmail email matching a search string arrives (`gmail`, `search`).
2. **Filter (in code):** the subject must contain the configured text and the To header must contain the configured recipient. Messages with no attachments stop here.
3. **Google Drive** uploads each attachment to the configured folder, named `<received date>_<original filename>`. A failed upload is counted, and the run continues with the next attachment.
4. **Gmail** adds the processed label to the message, but only if every upload succeeded. Otherwise the message is left unlabelled so the next run can retry it.

The Zap never sends, moves or deletes email. Its only Gmail action is adding the label.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting              | Where                                            | What goes there                                                                                             |
| -------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `SEARCH_QUERY`       | `config.ts`, and `query` in `triggers/search.ts` | The Gmail search that finds the report emails, in Gmail search syntax                                       |
| `SUBJECT_CRITERIA`   | `config.ts`                                      | Text the subject must contain before attachments are saved                                                  |
| `RECIPIENT_PATTERN`  | `config.ts`                                      | Text the To header must contain, such as the receiving mailbox address                                      |
| `DRIVE_FOLDER_ID`    | `config.ts`                                      | The Drive folder that receives the files, by its ID (the long ID in its URL). The folder must already exist |
| `PROCESSED_LABEL_ID` | `config.ts`                                      | The Gmail label added to processed messages. The label must already exist                                   |

Also review the default with them: `SHARED_DRIVE_ID` is empty, which uploads to My Drive. Set it to a shared drive's ID to upload there instead.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` (the Gmail account that receives the reports) and `google-drive` (the Google account that owns the destination folder) to the user's connections. Bind `google-drive` before publishing; the workflow cannot upload without it.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/search.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's `query` to the same search as `SEARCH_QUERY`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections, and sample the trigger, before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test (`run_workflow_draft` in Zapier MCP). It does not match the filter, so it writes nothing:

```json
{
  "id": "example-message-id",
  "subject": "Lunch plans",
  "to": "you@example.com",
  "date": "2026-10-29T10:00:00Z",
  "attachments": []
}
```

Confirm the run completes with `reason: "subject-or-recipient-did-not-match"`, and that no file was added to the folder and no label was added. Then run a second sample against a test email you control: send it to your own address, with the subject text and one attachment, and give the attachment's `url`. Check that the file appears in the folder with the date-prefixed name and that the message gets the processed label. Publish once both runs pass, and confirm the trigger is active.

If run-status tools aren't available, check the result in Gmail and Google Drive directly. The user deletes the test file and label afterwards, not the agent.

## Notes

- The attachment fields `url` and `filename` were assumed from the Gmail trigger payload, because the sample read returned no records. Check them on the first real run.
- Drive allows duplicate file names, so a second report with the same name and date creates a second file rather than overwriting.
- A message with several attachments is processed as one run. If any upload fails, the message stays unlabelled and the next matching run tries again, which can re-upload the attachments that already succeeded.
- To log uploads to a tracking sheet or ticketing system, add a step after the uploads. To name files by source email and timestamp, change `new_name` in `workflow.ts`.
- Folder IDs, label IDs and email addresses belong to the user's account. Don't commit them.
