---
name: save-incoming-client-faxes-and-scans-to-cloud-folder
description: Build a Zap on Zapier that saves each attachment arriving in a scanner or fax label to a secure Google Drive archive folder, with a standardized date-based filename, then labels the email as processed. Use when a legal team receives client faxes or scanner PDFs by email and needs them filed in one cloud folder, searchable by date, without manual uploads.
license: MIT
metadata:
  author: zapier
  summary: "Each fax or scan that lands in the scanner label is saved to your secure cloud folder under a dated, consistent filename and the email is marked processed, so legal staff can find client files fast."
  apps: "Gmail, Google Drive"
  category: "Legal"
  job: "E discovery litigation support"
  source: "https://zapier.com/automations/legal/e-discovery-litigation-support/document-collection-review/save-incoming-client-faxes-and-scans-to-cloud-folder"
---

# Save incoming client faxes and scans to cloud folder

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/save-incoming-client-faxes-and-scans-to-cloud-folder. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new attachment arrives in the scanner label (`gmail`, `attachment`).
2. **Filename:** the workflow builds it from the message date and the original attachment name, for example `2026-10-29_scan-0042.pdf`.
3. **Google Drive** (`google-drive`) uploads the attachment to the archive folder under that filename.
4. **Gmail** (`gmail`) adds the processed label to the message so the mailbox stays uncluttered.

The Zap only adds a label. It never moves, deletes or replies to the email.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                      | What goes there                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `REPLACE_SCANNER_LABEL_ID`   | The Gmail label the scanner or fax system files into. The trigger watches this label.                      |
| `REPLACE_PROCESSED_LABEL_ID` | The Gmail label added after each save. Create it first if it does not exist.                               |
| `REPLACE_ARCHIVE_FOLDER_ID`  | The Google Drive folder that is the secure archive. Create it first; the workflow does not create folders. |

Also confirm which Google account owns the archive uploads. It must be a work or firm account.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` to the user's work Gmail account, for the trigger and the label step, and `google-drive` to the Google Drive connection for the account that owns the archive folder. Every app here needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/attachment.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. Set the trigger's `label_ids` to the scanner label's ID so it fires only on that label. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Create a test email with a small PDF to the scanner label, then run it once as a draft test with this sample payload. Use `[install-test]` in the name of any test label or folder.

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

Compare the sample with a real trigger sample before publishing. If run-status tools aren't available, check the result in Google Drive and Gmail directly. The user deletes the test data, not the agent.

## Notes

- The processed step adds a label rather than moving the message out of the inbox.
- Keep real label, folder and account IDs out of any copy you share.
- To make PDFs searchable, add an OCR step before the upload.
- To file by client, route uploads into subfolders with a lookup table instead of one flat folder.
