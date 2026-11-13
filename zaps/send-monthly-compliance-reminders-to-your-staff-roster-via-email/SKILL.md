---
name: send-monthly-compliance-reminders-to-your-staff-roster-via-email
description: Build a Zap on Zapier that emails a monthly policy compliance reminder, with the policy file links attached, to everyone on a staff roster kept in Google Sheets. Use when HR needs a recurring reminder sent to all staff on a schedule, with confirmations collected before a monthly deadline.
license: MIT
metadata:
  author: zapier
  summary: "On the first of each month, every person on your staff roster gets the compliance reminder with the policy files attached, so HR can collect confirmations before the deadline."
  apps: "Schedule by Zapier, Google Sheets, Microsoft Outlook"
  category: "Human Resources (HR)"
  job: "HR compliance"
  source: "https://zapier.com/automations/human-resources-hr/hr-compliance/policy-distribution/send-monthly-compliance-reminders-to-your-staff-roster-via-email"
---

# Send monthly compliance reminders to your staff roster via email

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-monthly-compliance-reminders-to-your-staff-roster-via-email. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** Schedule by Zapier, Every Month (`schedule`, `everyMonth`), on the day and time set in `triggers/every-month.ts`.
2. **Google Sheets** reads the roster rows: name, email and policy file link.
3. Rows with a blank email are skipped. The remaining emails are de-duplicated and the file links are collected.
4. **Microsoft Outlook** sends one email. The roster addresses go in BCC, so recipients can't see each other, and the file links are attached.

If no roster row has an email, the run stops and sends nothing.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting          | What goes there                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| `SPREADSHEET_ID` | The staff roster sheet, found with the user's Google Sheets connection. It is the long ID in the sheet's URL        |
| `TO_ADDRESS`     | The address in the To field. Use one the user controls, since the roster goes in BCC. Outlook requires a To address |

Also review the defaults with them:

- `WORKSHEET_ID` in `config.ts`: the tab. `"0"` is the first tab.
- `ROSTER_RANGE`, `EMAIL_COLUMN`, `FILE_LINK_COLUMN` in `config.ts`: the roster is assumed to be name, email and file link in columns A to C. Map their headers to column keys such as `COL$B`.
- `dom` and `hod` in `triggers/every-month.ts`: the day of the month and the time, for example `["1"]` and `"9:00 AM"`, in the account's timezone.
- `SUBJECT_PREFIX`, `SUBJECT` in `config.ts` and `BODY` in `workflow.ts`: the email text. Leave the prefix empty for production.

Also confirm that the file links are shareable as direct downloads. Outlook fetches each link and attaches the file. Google Drive and Docs share links often return a web page, not the file.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` (the account that owns the roster) and `microsoft-outlook` (the account that sends the email) to the user's connections. Schedule by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/every-month.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a test roster sheet that has one row, whose email is the user's own address, and an empty input:

```json
{}
```

Check the sheet read first: `get_many_rows` with `output_format: "formatted_rows"` should return one row keyed `COL$A`, `COL$B`, `COL$C`.

Then confirm:

- The run completes and reports one BCC recipient.
- The email arrives at the user's own inbox, with the file attached or linked, and the only recipient is the To address.
- Point the Zap back at the real roster before publishing.

If run-status tools aren't available, check the result in Microsoft Outlook directly. Ask the user to delete the test row and the test email; the agent doesn't delete them.

## Notes

- The workflow sends a live email to every roster address on the day it runs. Test the roster first.
- Every roster file link is attached to the one email, and every recipient receives all of them. For one policy per person, send one email per row instead.
- File links must point straight to a downloadable file. A Google Sheets or Google Docs share link attaches a web page, not the document.
- The row cap is 1,500 rows (`MAX_ROSTER_ROWS` in `workflow.ts`). Larger rosters need the cap raised and a check of the Google Sheets limit.
- For managers on CC, change BCC to CC for them, or add a manager recipient column. For follow-up reminders, add a series for people who have not responded, at 72-hour intervals.
- Never commit a real spreadsheet ID or email address to a public copy of this file.
