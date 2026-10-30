---
name: send-incoming-receipts-to-tax-provider-and-archive
description: Build a Zapier Next Gen Zap that emails each new receipt in a Google Drive intake folder to your tax provider's upload address, waits a day so you can review it, then moves the original into a processed folder. Use when receipts land in Drive and need to reach the tax provider in batches without manual forwarding.
metadata:
  author: zapier
  summary: "Each new receipt in your intake folder is emailed to your tax provider, then filed away in a processed folder a day later."
  apps: "Google Drive, Gmail"
  category: "Finance"
  job: "Tax management"
  source: "https://zapier.com/automations/finance/tax-management/tax-document-collection/send-incoming-receipts-to-tax-provider-and-archive"
---

# Send incoming receipts to tax provider and archive

## What it does

1. **Trigger:** a new file is created in your intake folder (Google Drive, New File in Folder).
2. **Google Drive** looks for a file with the same name in the processed folder. If one exists, the run stops and sends nothing.
3. **Google Drive** downloads the new file.
4. **Gmail** emails the file as an attachment to your tax provider's upload address, from your connected Gmail account, with the subject `Receipt: <file name>`.
5. The workflow waits one day (`DELAY_SECONDS`) so a person can review the receipt first.
6. **Google Drive** moves the original file into the processed folder.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top.

1. **Trigger:** Google Drive, New File in Folder (`google-drive` / `file_in_folder_v2`). Set its folder to `INTAKE_FOLDER_ID`. It needs a Google Drive connection, with `authentication_id` set to that connection.
2. **Connections** (each alias in the code is the app's slug):
   - `google-drive`: the Google Drive account that owns the intake and processed folders.
   - `gmail`: the Gmail account that sends the email. Its address must be `SENDER_ADDRESS`.
3. **Constants:**
   - `INTAKE_FOLDER_ID`: the Drive folder receipts are dropped into. Also set as the trigger's folder.
   - `PROCESSED_FOLDER_ID`: the Drive folder originals are moved into.
   - `TAX_UPLOAD_ADDRESS`: your tax provider's upload inbox.
   - `SENDER_ADDRESS`: the connected Gmail address that sends the email.
   - `SUBJECT_TEMPLATE`, `BODY_TEXT`: the email subject and body.
   - `DELAY_SECONDS`: how long to wait before archiving. `86400` is one day.

## Ask the user

- Which Drive folder is the intake folder, and which is the processed folder?
- What is the tax provider's upload address?
- Which connected Gmail account sends the email?
- Should the delay be different from one day (for example a few hours for same-day uploads)?

## Test

A test needs a Drive connection and two Drive folders, and the account had no usable Drive connection. Once one is connected, test it like this:

1. Create two test folders in Drive named `[install-test] intake` and `[install-test] processed`. Set `INTAKE_FOLDER_ID` and `PROCESSED_FOLDER_ID` to their IDs.
2. Set `TAX_UPLOAD_ADDRESS` and `SENDER_ADDRESS` to the same connected Gmail address, so the test only emails you.
3. Set `DELAY_SECONDS` to `60` for the test, then back to `86400`.
4. Drop a small test file named `[install-test] receipt.pdf` in the intake folder and start a draft test run with input `{"id": "<the file's ID>", "title": "[install-test] receipt.pdf"}`.

Check that the email arrives with the attachment, that the file is in the processed folder after the delay, and that the intake folder no longer has it.

## Customize

- **Shorten the delay** to a few hours for same-day uploads: change `DELAY_SECONDS`.
- **Add a secondary recipient or review step** before sending high-value receipts: add a second address to `to`, or a pause for approval before the send step.

## Notes

- The duplicate check matches on file name only. The spec also says size, but the Find a File output wasn't checked, so the size comparison is not built.
- The attachment passes the download action's result straight to Gmail.
- Check them on the first test.
