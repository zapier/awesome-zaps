---
name: add-processed-employee-leave-records-to-master-spreadsheet
description: Build a Zap on Zapier that adds each processed employee leave record posted to a webhook as a new row in the HR master spreadsheet. Use when an HR system or form posts processed leave records to a webhook and payroll or HR coordinators keep an audit-ready list of leave in a Microsoft Excel workbook on OneDrive.
license: MIT
metadata:
  author: zapier
  summary: "Each processed leave record that arrives by webhook is added as a new row in your master HR spreadsheet, with dates in DD/MM/YYYY."
  apps: "Webhooks by Zapier, Microsoft Excel"
  category: "Human Resources (HR)"
  job: "HR operations"
  source: "https://zapier.com/automations/human-resources-hr/hr-operations/time-off-requests/add-processed-employee-leave-records-to-master-spreadsheet"
---

# Add processed employee leave records to master spreadsheet

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/add-processed-employee-leave-records-to-master-spreadsheet. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a processed leave record arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). An HR system or form posts to it.
2. **Plain code** trims and collapses whitespace in the text fields and turns `YYYY-MM-DD` dates into `DD/MM/YYYY`. Other date formats pass through unchanged.
3. **Microsoft Excel** appends one row to the end of the configured worksheet in the HR workbook.

The Zap only appends rows. It never updates earlier rows and does not check for duplicates.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting        | What goes there                                                               |
| -------------- | ----------------------------------------------------------------------------- |
| `WORKBOOK_ID`  | The Microsoft Excel workbook that is the master sheet, on the user's OneDrive |
| `WORKSHEET_ID` | The worksheet (tab) inside that workbook that holds the master sheet's rows   |

Also review the defaults with them:

- `FOLDER_ID`: the OneDrive folder holding the workbook. `"root"` is the top of the drive.
- `STORAGE_SOURCE`: `"one_drive"`, or `"sharepoint"` for a SharePoint workbook.
- The seven column headers (`EMPLOYEE_ID_COLUMN` to `NOTES_COLUMN`): each must match the worksheet's header row exactly.

Prerequisite question: does the sender post the fields `employee_id`, `employee_name`, `absence_type`, `start_date`, `end_date`, `provider` and `notes`? If it uses other names, change the input schema in `workflow.ts` before installing.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `excel` to the user's Microsoft Excel connection for the OneDrive account that owns the master workbook. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with the workbook set to a test copy of the master sheet (a worksheet whose headers match the constants):

```json
{
  "employee_id": "E-1042",
  "employee_name": "  Jane   Example ",
  "absence_type": "Annual leave",
  "start_date": "2026-11-03",
  "end_date": "2026-11-07",
  "provider": "Acme HR",
  "notes": "Approved by line manager"
}
```

Check that one new row was appended at the bottom of the worksheet, with `Employee ID` `E-1042`, `Employee Name` `Jane Example`, and the start and end dates as `03/11/2026` and `07/11/2026`. If run-status tools aren't available, check the result in Microsoft Excel directly. Then ask the user to delete that row from the test copy. Publish after the test passes, confirm the trigger is active, and give the user the webhook URL to point the HR system at.

## Notes

- Excel's Add Row step takes its column values from the worksheet's header row, so a renamed header breaks the mapping until the constants are updated.
- Dates are written as text in `DD/MM/YYYY`. The sheet may show them in its own format.
- To skip duplicates, look up the employee ID and date range first and skip the append when a matching row exists.
- To notify on long or high-severity absences, add a Slack or email step after the append.
- Anyone who can post to the catch hook can add rows to the master sheet. Keep the webhook URL private, and never commit a real workbook ID or webhook URL.
