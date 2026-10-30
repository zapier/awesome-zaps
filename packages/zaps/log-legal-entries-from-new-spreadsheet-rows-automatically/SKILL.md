---
name: log-legal-entries-from-new-spreadsheet-rows-automatically
description: Use when a legal or compliance team keeps intake rows in a Microsoft Excel table and wants each new row copied into a Zapier Table of legal entries, with the title, submission ID, notes and priority mapped across. Skips rows missing a title or submission ID.
metadata:
  author: zapier
  summary: "Each new row added to your Excel intake table becomes a legal entry record in a Zapier Table, so compliance staff work from one source of truth."
  apps: "Microsoft Excel, Zapier Tables"
  category: "Legal"
  job: "Compliance management"
  source: "https://zapier.com/automations/legal/compliance-management/compliance-task-tracking/log-legal-entries-from-new-spreadsheet-rows-automatically"
---

# Log legal entries from new spreadsheet rows automatically

## What it does

1. **Trigger:** a new row is added to a table in a Microsoft Excel workbook (New Row in Table).
2. **Filter:** the run continues only if the row has a title and a submission ID. Otherwise it stops and writes nothing.
3. **Zapier Tables** creates one record in the legal entries table: the row's title goes to Title, its submission ID to Submission ID, its notes to Notes, and its priority to Priority.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Microsoft Excel, New Row in Table (`excel`, `new_table_row`). Set its Workbook, Worksheet and Table fields to the tracker, using the same values as the constants below.
2. **Connections** (each alias in the code is the app's slug):
   - `zapier-tables`: the user's Zapier Tables connection, for the account that owns the legal entries table.
   - `excel`: the user's Microsoft Excel connection, for the account that owns the tracker. The trigger needs it.
3. **Constants:**
   - `WORKBOOK_ID`, `WORKSHEET_ID`, `EXCEL_TABLE_ID`: the tracker's workbook, worksheet and table. The code does not read them; they document what the trigger is set to.
   - `LEGAL_ENTRIES_TABLE_ID`: the Zapier Table that receives the records.
   - `TITLE_COLUMN`, `SUBMISSION_ID_COLUMN`, `NOTES_COLUMN`, `PRIORITY_COLUMN`: the tracker's column headers, as they appear in the sheet's header row.
4. Test with the steps below, then publish, wait until the trigger is active, and confirm the trigger is on the new table.

## Ask the user

- Which Microsoft Excel workbook, worksheet and table hold the intake rows?
- Which Zapier Table should receive the legal entries?
- What are the header names of the title, submission ID, notes and priority columns? The code reads them by header name.
- Should a row with a priority flag go somewhere else, such as senior counsel? Not built here; see Customize.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, using a row from the tracker:

```json
{
  "Title": "[install-test] Vendor NDA renewal",
  "Submission ID": "INTAKE-0001",
  "Notes": "Renewal due next quarter",
  "Priority": "High"
}
```

Confirm that one new record appears in the legal entries table with the same title, submission ID, notes and priority. Then delete that record if it was test data. Then send a row with no title and check that nothing is created.

## Customize

- **Escalate high-priority rows:** add a notification step for rows with priority set to High, to notify senior counsel.
- **Batch lower-priority intake:** collect rows and write them into the tracker hourly instead of one at a time.

## Notes

- Each row creates a new record. The workflow does not check for an earlier record with the same submission ID, so a row that is added twice creates two records.
- The Excel trigger needs the user's own Microsoft Excel connection. Without it the trigger cannot be set up.
