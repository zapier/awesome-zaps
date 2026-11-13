---
name: send-incoming-receipts-to-tax-provider-and-archive
description: Build a Zap on Zapier that emails each new receipt in a Google Drive intake folder to your tax provider's upload address, waits a day so you can review it, then moves the original into a processed folder. Use when receipts land in Drive and need to reach the tax provider in batches without manual forwarding.
license: MIT
metadata:
  author: zapier
  summary: "Each new receipt in your intake folder is emailed to your tax provider, then filed away in a processed folder a day later."
  apps: "Google Drive, Gmail"
  category: "Finance"
  job: "Tax management"
  source: "https://zapier.com/automations/finance/tax-management/tax-document-collection/send-incoming-receipts-to-tax-provider-and-archive"
---

# Send incoming receipts to tax provider and archive

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-incoming-receipts-to-tax-provider-and-archive. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new file is created in your intake folder (`google-drive`, `file_in_folder_v2`).
2. **Google Drive** looks for a file with the same name in the processed folder. If one exists, the run stops and sends nothing.
3. **Google Drive** downloads the new file.
4. **Gmail** emails the file as an attachment to your tax provider's upload address, from your connected Gmail account, with the subject `Receipt: <file name>`.
5. The workflow waits one day (`DELAY_SECONDS`) so a person can review the receipt first.
6. **Google Drive** moves the original file into the processed folder.

The Zap only moves originals. It never deletes one.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting               | What goes there                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `INTAKE_FOLDER_ID`    | The Google Drive folder receipts land in. Ask which folder, then look up its ID with the Drive connection. Also set as the trigger's folder |
| `PROCESSED_FOLDER_ID` | The Google Drive folder originals move into after the delay. Ask which folder, then look up its ID with the Drive connection                |
| `TAX_UPLOAD_ADDRESS`  | The tax provider's upload inbox address. Ask the user; no connection holds it                                                               |
| `SENDER_ADDRESS`      | The address of the connected Gmail account that sends the email. Look it up with the Gmail connection; it must be that account              |

Also review the defaults with them: `DELAY_SECONDS` (in `workflow.ts`, `86400`, one day; use a few hours for same-day uploads), `SUBJECT_TEMPLATE` and `BODY_TEXT` (in `config.ts`).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-drive` to the user's Google Drive connection for the account that owns both folders, and `gmail` to the Gmail connection that sends the email. No other apps need a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/file-in-folder.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's folder to `INTAKE_FOLDER_ID`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Test with test folders and a test file, not real receipts:

1. Create two test folders in Drive named `[install-test] intake` and `[install-test] processed`. Set `INTAKE_FOLDER_ID` and `PROCESSED_FOLDER_ID` to their IDs.
2. Set `TAX_UPLOAD_ADDRESS` and `SENDER_ADDRESS` to the same connected Gmail address, so the test only emails the user.
3. Set `DELAY_SECONDS` to `60` for the test, then back to `86400`.
4. Drop a small test file named `[install-test] receipt.pdf` in the intake folder and start a draft test run with input `{"id": "<the file's ID>", "title": "[install-test] receipt.pdf"}`.

Check that the email arrives with the attachment, that the file is in the processed folder after the delay, and that the intake folder no longer has it. If run-status tools aren't available, check the result in Google Drive and Gmail directly. The user deletes the test folders, file and email; the agent does not. Then publish, and confirm the trigger is active.

## Notes

- To shorten the delay for same-day uploads, change `DELAY_SECONDS`. To add a second recipient, add an address to `to`; for an approval step before high-value receipts are sent, add a pause before the send step.
- The duplicate check matches on file name only. File size is not compared.
- The attachment passes the download action's result straight to Gmail. Check it on the first test.
