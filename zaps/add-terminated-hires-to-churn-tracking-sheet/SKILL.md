---
name: add-terminated-hires-to-churn-tracking-sheet
description: Build a Zap on Zapier that adds a row to a central Google Sheets churn tracker whenever an employment is terminated in Personio, with the employee's name, termination and hire dates as DD/MM/YYYY, department and weekly hours. Use when an HR, People Ops or payroll team runs Personio and wants offboarding and employee turnover logged for specific departments without copying data by hand.
license: MIT
metadata:
  author: zapier
  summary: "When an employment is terminated in Personio, the leaver's name, dates, department and weekly hours are added to your central churn sheet, so payroll and recruiting work from the same list."
  apps: "Personio, Google Sheets"
  category: "Human Resources (HR)"
  job: "Talent pipeline management"
  source: "https://zapier.com/automations/human-resources-hr/talent-pipeline-management/employee-offboarding/add-terminated-hires-to-central-churn-tracking-sheet"
---

# Add terminated hires to churn tracking sheet

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/add-terminated-hires-to-churn-tracking-sheet. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** an employment is terminated in Personio (`personio`, `employment_terminated_instant`).
2. **Filter:** the run continues only when the employee's department contains one of the names in `TRACKED_DEPARTMENTS`, ignoring case. Any other department stops the run and writes nothing.
3. **Format:** the termination and hire dates become `DD/MM/YYYY` text, read from the date part only so a time zone never moves the day.
4. **Google Sheets** (`google-sheets`) adds one new row to the churn sheet: full name, termination date, hire date, department and weekly working hours. It only adds rows and never changes an existing one; week and month columns are left to the sheet's own formulas.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | What goes there                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_SPREADSHEET_ID` | The central churn sheet: ask which sheet it is, then look up its ID (the long ID in its URL) with the user's Google Sheets connection |

Also review the defaults with them:

- `WORKSHEET_ID`: the tab. The first tab is `"0"`.
- `TRACKED_DEPARTMENTS` (in `workflow.ts`): the Personio departments to record, such as `["Fulfillment", "Warehouse"]`. Partial names match, so `Fulfillment` also matches `Fulfillment Berlin`.
- `NAME_COLUMN`, `TERMINATION_DATE_COLUMN`, `HIRE_DATE_COLUMN`, `DEPARTMENT_COLUMN`, `HOURS_COLUMN`: column keys such as `COL$A`, not header names. Map the user's headers to their column letters.

Also confirm, before building:

- Do the week and month columns already have formulas that read the termination date? The zap writes dates as `DD/MM/YYYY` text, so those formulas must parse that format.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` (the account that owns the churn sheet) to the user's Google Sheets connection, and the trigger's `personio` to the user's Personio connection, which needs API access to employee attributes. No app needs a connection of its own beyond these two.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/employment-terminated.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger with the user's Personio connection before the first test run. Check that the record carries `department`, `hire_date`, `termination_date` and `weekly_working_hours` under those names; if any arrive under other keys, update the field reads in `workflow.ts` to match the sample.

## Test it

Run this sample as a draft test run, pointed at a copy of the churn sheet, with no real employee data:

```json
{
  "id": "100234",
  "first_name": "Sam",
  "last_name": "Rivera",
  "email": "sam.rivera@example.com",
  "department": { "name": "Fulfillment Berlin" },
  "hire_date": "2024-03-04T00:00:00+01:00",
  "termination_date": "2026-11-30T00:00:00+01:00",
  "weekly_working_hours": "40"
}
```

Confirm one new row reads `Sam Rivera`, `30/11/2026`, `04/03/2024`, `Fulfillment Berlin`, `40`, and that the week and month formulas fill in. Then run it again with `"department": { "name": "Sales" }` and confirm nothing is written. If run-status tools aren't available, check the copied sheet directly. Ask the user to delete the test row afterwards; the agent doesn't delete test data. Publish only after both runs pass, and confirm the trigger is active.

## Notes

- Each termination adds a new row. If the same termination fires twice, the sheet gets two rows.
- A date that arrives in a format other than `YYYY-MM-DD...` is written as received.
- The sheet holds leaver data, so share it only with the people who need it, and never commit a real spreadsheet ID.
- To extend it: add a Slack or email step after the row is added to alert payroll when a leaver works high hours, for example 35 or more a week, or add a column for the recruiter or manager who owns the follow-up.
