---
name: add-processed-employee-leave-records-to-master-spreadsheet
description: Use when an HR system or form posts processed employee leave records to a webhook and each one should be added as a new row in the HR master spreadsheet. Use it when payroll or HR coordinators keep an audit-ready list of leave in a Microsoft Excel workbook on OneDrive.
metadata:
  author: zapier
  summary: "Each processed leave record that arrives by webhook is added as a new row in your master HR spreadsheet, with dates in DD/MM/YYYY."
  apps: "Webhooks by Zapier, Microsoft Excel"
  category: "Human Resources (HR)"
  job: "HR operations"
  source: "https://zapier.com/automations/human-resources-hr/hr-operations/time-off-requests/add-processed-employee-leave-records-to-master-spreadsheet"
---

# Add processed employee leave records to master spreadsheet

## What it does

1. **Trigger:** a processed leave record arrives at a Webhooks by Zapier catch hook (an HR system or form posts to it).
2. **Plain code** trims and collapses whitespace in the text fields and turns `YYYY-MM-DD` dates into `DD/MM/YYYY`. Other date formats pass through unchanged.
3. **Microsoft Excel** appends one row to the end of the configured worksheet in the HR workbook. It never updates earlier rows, and it does not check for duplicates.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `excel`: the user's Microsoft Excel connection, for the OneDrive account that owns the master workbook. The workbook must be on OneDrive for Business; Excel on Zapier does not support other storage.
3. **Constants:**
   - `WORKBOOK_ID`: the workbook's file ID.
   - `WORKSHEET_ID`: the worksheet (tab) ID inside that workbook.
   - `FOLDER_ID`: the OneDrive folder holding the workbook. `"root"` is the top of the drive.
   - `STORAGE_SOURCE`: `"one_drive"`, or `"sharepoint"` for a SharePoint workbook.
   - Column headers `EMPLOYEE_ID_COLUMN`, `EMPLOYEE_NAME_COLUMN`, `ABSENCE_TYPE_COLUMN`, `START_DATE_COLUMN`, `END_DATE_COLUMN`, `PROVIDER_COLUMN`, `NOTES_COLUMN`: each must match the worksheet's header row exactly.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point the HR system at.

## Ask the user

- Which workbook, worksheet and OneDrive folder hold the master sheet? Is it on OneDrive or SharePoint?
- What are the header names of the master sheet's columns? The code writes to these names.
- Does the sender post the fields `employee_id`, `employee_name`, `absence_type`, `start_date`, `end_date`, `provider` and `notes`? If it uses other names, change the input schema before installing.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, against a test copy of the master workbook (a worksheet whose headers match the constants):

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

Confirm that one new row was appended at the bottom of the worksheet, with `Employee ID` `E-1042`, `Employee Name` `Jane Example`, and the start and end dates as `03/11/2026` and `07/11/2026`. Then delete that row from the test copy.

## Customize

- **Skip duplicates:** look up the employee ID and date range first, and skip the append when a matching row already exists.
- **Notify on long or high-severity absences:** add a Slack or email step after the append when the absence is long.

## Notes

- Excel's Add Row step takes its column values from the worksheet's header row, so a renamed header breaks the mapping until the constants are updated.
- Dates are written as text in `DD/MM/YYYY`. The sheet may show them in its own format.
- Anyone who can post to the catch hook can add rows to the master sheet. Keep the webhook URL private.
- Never commit a real workbook ID or webhook URL.
