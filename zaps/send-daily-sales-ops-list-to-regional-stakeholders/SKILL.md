---
name: send-daily-sales-ops-list-to-regional-stakeholders
description: Build a Zap on Zapier that finds a designated sales worksheet in a Google Drive folder each weekday morning and emails it to stakeholders through Outlook, with the ops owner copied. Use when a sales ops or operations team wants the same daily list in regional stakeholders' inboxes before standups, without anyone sending it by hand.
license: MIT
metadata:
  author: zapier
  summary: "Every weekday morning, the day's sales ops worksheet is found in your Drive folder and emailed to your regional stakeholders, with the ops owner copied, so everyone starts standup with the same list."
  apps: "Schedule by Zapier, Google Drive, Microsoft Outlook"
  category: "Data & Analytics"
  job: "Business intelligence"
  source: "https://zapier.com/automations/data-analytics/business-intelligence/report-distribution/send-daily-sales-ops-list-to-regional-stakeholders"
---

# Send daily sales ops list to regional stakeholders

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-daily-sales-ops-list-to-regional-stakeholders. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** Schedule by Zapier fires every weekday (Monday to Friday) at the morning time, in the schedule's timezone (`schedule`, `everyWeek`).
2. **Google Drive** searches the folder for the worksheet whose title exactly matches the configured title.
3. If no file is found, the run stops and sends nothing, so a wrong title fails quietly rather than sending an empty email.
4. **Microsoft Outlook** sends the email: To and CC from the configured lists, the worksheet attached, and a short body naming the file.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                     | What goes there                                                                  |
| --------------------------- | -------------------------------------------------------------------------------- |
| `REPLACE_FOLDER_ID`         | The Drive folder that holds the worksheet, found with their Google Drive account |
| `REPLACE_WORKSHEET_TITLE`   | The worksheet file's exact title, or the pattern to match                        |
| `REPLACE_STAKEHOLDER_EMAIL` | The regional stakeholders' email addresses for To, in `workflow.ts`              |
| `REPLACE_OPS_OWNER_EMAIL`   | The ops owner's email address for CC, in `workflow.ts`                           |

Also review the defaults with them: `SUBJECT` in `config.ts` (the email subject), the weekday schedule and the 9:00 AM morning time in `triggers/every-week.ts` (`dow` and `hod`), and the schedule's timezone (set `timezone_override` on the trigger if it should differ from the default). Ask whether ops should get an alert when the worksheet is missing; the default stops quietly.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-drive` to the Google account that owns the worksheet folder, and `microsoft-outlook` to the Outlook account that sends the email. Schedule by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/every-week.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the Drive search and the Outlook send with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a test folder that holds one copy of the worksheet, and send only to the user's own address. The trigger is a schedule, so the run input is empty. Check that the Drive search returns exactly one file and that the email arrives at the test address with the worksheet attached and the CC set. Then point the test at a folder with no matching file: it should return `worksheet-not-found` and send nothing.

If run-status tools aren't available, check the result in Outlook directly. Ask the user to delete the test email and copy, since the agent does not delete data.

## Notes

- The worksheet is attached through the Drive file's link, and folder scoping is not verified yet. Check the attachment and the search on the first real send.
- Don't commit a real folder ID or email address; the `REPLACE_…` values are placeholders for that reason.
- To extend it, attach a generated summary export from a spreadsheet row range before the send, or route recipients by region or team with a lookup table.
