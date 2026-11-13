---
name: create-payroll-rows-from-extra-hours-form-submissions
description: Build a Zap on Zapier that turns each extra-hours form submission (Typeform) into a payroll row in a Google Sheets worksheet and emails the payroll clerks to review it before payroll runs. Use when extra-hours submissions should land as payroll rows and the clerks should get an email for each one. Matches on the submission ID, so a resubmitted entry updates its row instead of adding a duplicate.
license: MIT
metadata:
  author: zapier
  summary: "Each extra-hours form submission is written to your payroll sheet, and your payroll clerks get an email with the submission reference and the sheet to review before payroll runs."
  apps: "Typeform, Google Sheets, Gmail"
  category: "Human Resources (HR)"
  job: "Payroll compensation"
  source: "https://zapier.com/automations/human-resources-hr/payroll-compensation/payroll-processing/create-payroll-rows-from-extra-hours-form-submissions"
---

# Create payroll rows from extra hours form submissions

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-payroll-rows-from-extra-hours-form-submissions. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Typeform submission arrives for the extra-hours form (`typeform`, `entries_resthook_v2`, New Entry).
2. **Google Sheets** looks for a row whose submission ID matches the Typeform response ID. If it finds one, it updates that row. If not, it adds a row with the worker name, date, hours and notes.
3. **Gmail** sends one notification to the payroll clerks: subject "Extra hours submission <submission ID> needs payroll review", with the submission reference, worker, date, hours and a link to the sheet.

The Zap only writes the sheet and sends the notification. Payroll clerks review each row before payroll runs.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting           | What goes there                                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| `FORM_ID`         | The Typeform form ID of the extra-hours form, from the form the user picks. Also set it as the trigger's `formId` |
| `SPREADSHEET_ID`  | The payroll spreadsheet: the long ID in the sheet's URL, from the sheet the user picks                            |
| `PAYROLL_EMAIL`   | The email address that gets the payroll clerk notification                                                        |
| `WORKER_NAME_REF` | The Typeform question ref for the worker's name, from the questions in `FORM_ID`                                  |
| `DATE_REF`        | The Typeform question ref for the date, from the questions in `FORM_ID`                                           |
| `HOURS_REF`       | The Typeform question ref for the hours, from the questions in `FORM_ID`                                          |
| `NOTES_REF`       | The Typeform question ref for the notes, from the questions in `FORM_ID`                                          |

Also review the defaults with them: `WORKSHEET_ID` (`"0"` is the first tab). The column keys `SUBMISSION_ID_COLUMN` to `DESCRIPTION_COLUMN` (`COL$A` to `COL$E`) must match the sheet: column A submission ID, B worker name, C date, D hours, E notes.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `typeform` (reads the extra-hours form, for the trigger), `google-sheets` (the Google account that owns the payroll sheet) and `gmail` (the Gmail account that sends the notification) to the user's connections. Every app in this Zap needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/entries-resthook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it. Set the trigger's `formId` to `FORM_ID`.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a sheet and address the user controls, and a sample entry:

```json
{
  "id": "test-submission-0001",
  "submitted_at": "2026-11-09T15:00:00Z",
  "answers": {
    "<WORKER_NAME_REF>": "Sample Worker",
    "<DATE_REF>": "2026-11-09",
    "<HOURS_REF>": "2",
    "<NOTES_REF>": "Sample extra hours"
  }
}
```

Use the question refs from `config.ts` as the keys. Check that:

- A new submission ID adds one row with the worker name, date, hours and notes filled in.
- Running the same entry again updates that row and does not add a second one.
- One email arrives at `PAYROLL_EMAIL` with the submission reference in its subject and body.

If run-status tools aren't available, check the result in Google Sheets and Gmail directly. Ask the user to delete the test rows and email; the agent does not delete them. Then publish, confirm the trigger is active, and give the user the trigger's `webhook_url` if one is shown.

## Notes

- The notification links to the sheet's tab, not to the exact row.
- The Typeform New Entry output has no answer fields, so the form values are read from an `answers` object keyed by question ref. Confirm that shape on the first sample before relying on it.
- To alert the team somewhere faster, swap Gmail for any team chat or SMS provider. To keep the rows somewhere else, swap Google Sheets for a time-tracking table or HR database. Neither is built here.
- Never commit a real spreadsheet ID, form ID or email address.
