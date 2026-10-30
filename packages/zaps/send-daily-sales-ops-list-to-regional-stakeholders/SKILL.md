---
name: send-daily-sales-ops-list-to-regional-stakeholders
description: Build a Zapier Next Gen Zap that finds a designated sales worksheet in a Google Drive folder each weekday morning and emails it to stakeholders through Outlook, with the ops owner copied. Use when a sales ops or operations team wants the same daily list in regional stakeholders' inboxes before standups, without anyone sending it by hand.
metadata:
  author: zapier
  summary: "Every weekday morning, the day's sales ops worksheet is found in your Drive folder and emailed to your regional stakeholders, with the ops owner copied, so everyone starts standup with the same list."
  apps: "Schedule by Zapier, Google Drive, Microsoft Outlook"
  category: "Data & Analytics"
  job: "Business intelligence"
  source: "https://zapier.com/automations/data-analytics/business-intelligence/report-distribution/send-daily-sales-ops-list-to-regional-stakeholders"
---

# Send daily sales ops list to regional stakeholders

## What it does

1. **Trigger:** Schedule by Zapier fires every weekday (Monday to Friday) at the configured morning time, in the configured timezone.
2. **Google Drive** searches the configured folder for the worksheet whose title exactly matches the configured title.
3. If no file is found, the run stops and sends nothing.
4. **Microsoft Outlook** sends the email: To and CC from the configured lists, the worksheet attached, and a short body naming the file.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Schedule by Zapier, Every Week (`schedule`, `everyWeek`). It needs no connection, so its `authentication_id` is `null`. Set `dow` to Monday through Friday (`"0"` to `"4"`), `hod` to the morning time, and `timezone_override` to the timezone you want.
2. **Connections** (each alias in the code is the app's slug):
   - `google-drive`: the Google account that owns the worksheet folder.
   - `microsoft-outlook`: the Outlook account that sends the email. Emails go from this account.
3. **Constants:**
   - `FOLDER_ID`: the Drive folder that holds the worksheet.
   - `WORKSHEET_TITLE`: the exact file title.
   - `RECIPIENTS`: the stakeholder email addresses.
   - `CC_RECIPIENTS`: the ops owner's address.
   - `SUBJECT`: the email subject.
4. Test with the steps below, then publish. Wait until the trigger reads `active`, then give the user the editor link.

## Ask the user

- Which Drive folder holds the worksheet, and what is its exact title (or pattern)?
- Which Outlook account sends the email, and who are the stakeholders and the ops owner?
- What morning time and timezone should the schedule use?
- Should the run post an alert to ops when the worksheet is missing? The default is to stop quietly.

## Test

Run this as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. The trigger is a schedule, so there is no payload; the run input is empty. Use a test folder that holds one copy of the worksheet, and send only to your own address. Then:

- Confirm the Drive search returned exactly one file.
- Confirm the email arrived at the test address with the worksheet attached and the CC set.
- Confirm a second run against a folder with no matching file returns `worksheet-not-found` and sends nothing.

## Customize

- **Attach a generated summary export** from a spreadsheet row range, before the send.
- **Route recipients by region or team** using a lookup table.

## Notes

- Drive folder scoping and the attachment link are not verified yet; see the lossy list in `result.json`. Run the test before relying on either.
- The worksheet is attached through the Drive file's link. Check the attachment on the first real send.
- Never commit a real folder ID, email address or webhook URL. The `RECIPIENTS` and `CC_RECIPIENTS` constants are placeholders for that reason.
