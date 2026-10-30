---
name: send-monthly-compliance-reminders-to-your-staff-roster-via-email
description: Build a Zapier Next Gen Zap that emails a monthly policy compliance reminder, with the policy file links attached, to everyone on a staff roster kept in Google Sheets. Use when HR needs a recurring reminder sent to all staff on a schedule, with confirmations collected before a monthly deadline.
metadata:
  author: zapier
  summary: "On the first of each month, every person on your staff roster gets the compliance reminder with the policy files attached, so HR can collect confirmations before the deadline."
  apps: "Schedule by Zapier, Google Sheets, Microsoft Outlook"
  category: "Human Resources (HR)"
  job: "HR compliance"
  source: "https://zapier.com/automations/human-resources-hr/hr-compliance/policy-distribution/send-monthly-compliance-reminders-to-your-staff-roster-via-email"
---

# Send monthly compliance reminders to your staff roster via email

## What it does

1. **Trigger:** Schedule by Zapier, Every Month, on the day and time you set (see Build it).
2. **Google Sheets** reads the roster rows: name, email and policy file link.
3. Rows with a blank email are skipped. The remaining emails are de-duplicated and the file links are collected.
4. **Microsoft Outlook** sends one email. The roster addresses go in BCC, so recipients can't see each other, and the file links are attached.

If no roster row has an email, the run stops and sends nothing.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top.

1. **Trigger:** Schedule by Zapier, Every Month (`schedule`, `everyMonth`). It needs no connection, so its `authentication_id` is `null`. Set `dom` to the day of the month and `hod` to the time, for example `["1"]` and `"9:00 AM"`, in the account's timezone.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the Google Sheets connection for the account that owns the roster.
   - `microsoft-outlook`: the Microsoft Outlook connection for the account that sends the email.
3. **Constants:**
   - `SPREADSHEET_ID`: the long ID in the roster sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `ROSTER_RANGE`, `MAX_ROSTER_ROWS`: the columns read and the row cap. The roster is assumed to be name, email, file link in columns A to C.
   - `EMAIL_COLUMN`, `FILE_LINK_COLUMN`: column keys such as `COL$B`. Map the user's headers to their column letters.
   - `TO_ADDRESS`: the address in the To field. Outlook requires one. Use an address you control; the roster goes in BCC.
   - `SUBJECT_PREFIX`, `SUBJECT`, `BODY`: the email text. Leave the prefix empty for production.

## Ask the user

- Which sheet and tab is the roster, and which columns hold the name, email and policy file link?
- Which day of the month and what time should the reminder go out, and in which timezone?
- What should the To address be? (The roster goes in BCC.)
- What should the subject and body say?
- Are the file links shareable as direct downloads? Outlook fetches each link and attaches the file. Google Drive and Docs share links often return a web page, not the file.

## Test

Use a test roster sheet with one row whose email is your own work address, and an empty input `{}`. Check the sheet read first: `get_many_rows` with `output_format: "formatted_rows"` should return one row keyed `COL$A`, `COL$B`, `COL$C`.

Then confirm:

- The run completes and reports one BCC recipient.
- The email arrives at your own inbox, with the file attached or linked, and the only recipient is the To address.
- Put the real roster back, and don't keep test rows in it.

## Customize

- **Managers on CC:** change BCC to CC for managers, or add a manager recipient column.
- **Follow-up reminders:** add a follow-up reminder series for people who have not responded, at 72-hour intervals.

## Notes

- The workflow sends a live email to every roster address on the day it runs. Test the roster first.
- Every roster file link is attached to the one email, and every recipient receives all of them. If each person should get only their own policy, send one email per row instead.
- File links must point straight to a downloadable file. A Google Sheets or Google Docs share link attaches a web page, not the document.
- The row cap is 1,500 rows. Larger rosters need the cap raised and a check of the Google Sheets limit.
- Never commit a real spreadsheet ID or email address to a public copy of this file.
