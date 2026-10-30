---
name: create-payroll-rows-from-extra-hours-form-submissions
description: Use when extra-hours form submissions (Typeform) should land as payroll rows in a Google Sheets worksheet and the payroll clerks should get an email to review each one before payroll runs. Matches on the submission ID, so a resubmitted entry updates its row instead of adding a duplicate.
metadata:
  author: zapier
  summary: "Each extra-hours form submission is written to your payroll sheet, and your payroll clerks get an email with the submission reference and the sheet to review before payroll runs."
  apps: "Typeform, Google Sheets, Gmail"
  category: "Human Resources (HR)"
  job: "Payroll compensation"
  source: "https://zapier.com/automations/human-resources-hr/payroll-compensation/payroll-processing/create-payroll-rows-from-extra-hours-form-submissions"
---

# Create payroll rows from extra hours form submissions

## What it does

1. **Trigger:** a Typeform submission arrives for the extra-hours form (Typeform, New Entry).
2. **Google Sheets** looks for a row whose submission ID matches the Typeform response ID. If it finds one, it updates that row. If not, it creates a new row with the worker name, date, hours and notes.
3. **Gmail** sends one notification to the payroll clerks: subject "Extra hours submission <submission ID> needs payroll review", with the submission reference, worker, date, hours and a link to the sheet.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Typeform, New Entry (`typeform`, action `entries_resthook_v2`). Set `formId` to your form. It needs a Typeform connection.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the Google account that owns the payroll sheet.
   - `gmail`: the Gmail account that sends the notification.
3. **Constants:**
   - `FORM_ID`: the Typeform form ID.
   - `SPREADSHEET_ID`: the long ID in the sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `PAYROLL_EMAIL`: where the notification goes.
   - `WORKER_NAME_REF`, `DATE_REF`, `HOURS_REF`, `NOTES_REF`: the Typeform question refs for the four form fields.
   - `SUBMISSION_ID_COLUMN`, `NAME_COLUMN`, `DATE_COLUMN`, `HOURS_COLUMN`, `DESCRIPTION_COLUMN`: column keys such as `COL$A`, not header names. Map the sheet's headers to their column letters.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the trigger's `webhook_url` if one is shown.

## Ask the user

- Which Typeform form is the extra-hours form, and what are its question refs for worker name, date, hours and notes?
- Which spreadsheet and tab hold the payroll rows, and which columns hold the submission ID, name, date, hours and notes?
- Which email address should receive the payroll clerk notification?

## Test

No test run was made. To test, use a sheet and address you own, and submit a real or sample entry to the form. Then check:

- A new submission ID adds one new row with the four fields filled.
- Submitting the same entry again updates that row and does not add a second one.
- One email arrives at `PAYROLL_EMAIL` with the submission reference in its subject and body.

## Customize

- **Replace Gmail with any team chat or SMS provider for instant alerts.** Not built.
- **Swap Google Sheets for any time-tracking table or HR database.** Not built.

## Notes

- The notification links to the sheet's tab, not to the exact row.
- The Typeform New Entry output declared by the app has no answer fields, so the form values are read from an `answers` object keyed by question ref. Confirm that shape on the first sample before relying on it.
- Never commit a real spreadsheet ID, form ID or email address.
