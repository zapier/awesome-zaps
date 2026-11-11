---
name: add-terminated-hires-to-churn-tracking-sheet
description: Build a Zapier Next Gen Zap that adds a row to a central Google Sheets churn tracker whenever an employment is terminated in Personio, with the employee's name, termination and hire dates as DD/MM/YYYY, department and weekly hours. Use when an HR, People Ops or payroll team runs Personio and wants offboarding and employee turnover logged for specific departments without copying data by hand.
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

## What it does

1. **Trigger:** an employment is terminated in Personio (Employment Terminated, instant).
2. **Filter:** the run continues only when the employee's department contains one of the names in `TRACKED_DEPARTMENTS`, ignoring case. Any other department stops the run and writes nothing.
3. **Format:** the termination and hire dates become `DD/MM/YYYY` text, read from the date part only so a time zone never moves the day.
4. **Google Sheets** adds one new row to the churn sheet: full name, termination date, hire date, department and weekly working hours. It never updates an existing row. Week and month columns are left to the sheet's own formulas.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and the trigger's fields (`get_trigger_fields`), and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** the files in this folder are the whole zap. `workflow.ts` is the workflow. It imports its settings from `config.ts` and each account from `connections/<alias>.ts`, and `triggers/` holds what starts it.

- **With the zap CLI:** `npx zap-pack add awesome-zaps/add-terminated-hires-to-churn-tracking-sheet` (it makes a zap project if you aren't in one), then `npx zap-pack deploy add-terminated-hires-to-churn-tracking-sheet` from that project. Deploy asks for each open setting and account, and sets the trigger.
- **With Zapier MCP:** publish every `.ts` file outside `triggers/` as `sourceFiles`, with three changes: write `config.ts` as plain values (`export const NAME = "value";`), write each `connections/<alias>.ts` as `export default "<alias>";`, and write each `@/name` import as a relative path ending in `.ts` (`./config.ts`, `./connections/<alias>.ts`). Set the trigger from the file in `triggers/`.

1. **Trigger:** Personio, Employment Terminated (`employment_terminated_instant`). It takes no parameters. Its `authentication_id` is the user's Personio connection, which needs API access to employee attributes.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the user's Google Sheets connection, for the account that owns the churn sheet.
   - `personio`: the user's Personio connection, used by the trigger.
3. **Constants:**
   - `SPREADSHEET_ID`: the long ID in the churn sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `TRACKED_DEPARTMENTS`: the department names to record, such as `["Fulfillment", "Warehouse"]`. Defaults to `["Fulfillment"]`.
   - `NAME_COLUMN`, `TERMINATION_DATE_COLUMN`, `HIRE_DATE_COLUMN`, `DEPARTMENT_COLUMN`, `HOURS_COLUMN`: column keys such as `COL$A`, not header names. Map the user's headers to their column letters.
4. Test with the steps below, then publish and wait until the trigger is active.

## Ask the user

- Which sheet and tab is the churn tracker, and which columns hold name, termination date, hire date, department and hours?
- Which Personio departments should be recorded? Partial names work: `Fulfillment` also matches `Fulfillment Berlin`.
- Do the week and month columns already have formulas that read the termination date? The zap writes dates as `DD/MM/YYYY` text, so the formulas must parse that format.

## Test

Before the first test, sample the trigger with the user's Personio connection and check that the record carries `department`, `hire_date`, `termination_date` and `weekly_working_hours` under those names. If any arrive under other keys, update the schema and field reads to match the sample.

Then run this sample as a draft test run (`run_workflow_draft` in Zapier MCP), pointed at a copy of the churn sheet:

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

Confirm one new row reads `Sam Rivera`, `30/11/2026`, `04/03/2024`, `Fulfillment Berlin`, `40`, and that the week and month formulas fill in. Then run it again with `"department": { "name": "Sales" }` and confirm nothing is written. Delete the test row afterwards.

## Customize

- **Alert payroll:** add a Slack or email step after the row is added when a leaver works high hours, for example 35 or more a week.
- **Owner column:** add the recruiter or manager to the row so someone owns the follow-up.

## Notes

- Each termination adds a new row. If the same termination fires twice, the sheet gets two rows.
- If a date arrives in a format other than `YYYY-MM-DD...`, it is written as received.
- Never commit a real spreadsheet ID. The sheet holds leaver data, so share it only with the people who need it.
