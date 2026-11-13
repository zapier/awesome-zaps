---
name: log-legal-entries-from-new-spreadsheet-rows-automatically
description: Build a Zap on Zapier that copies each new row in a Microsoft Excel intake table into a Zapier Table of legal entries, with the title, submission ID, notes and priority mapped across. Use when a legal or compliance team keeps intake rows in a Microsoft Excel table and wants each new row copied into a Zapier Table. Skips rows missing a title or submission ID.
license: MIT
metadata:
  author: zapier
  summary: "Each new row added to your Excel intake table becomes a legal entry record in a Zapier Table, so compliance staff work from one source of truth."
  apps: "Microsoft Excel, Zapier Tables"
  category: "Legal"
  job: "Compliance management"
  source: "https://zapier.com/automations/legal/compliance-management/compliance-task-tracking/log-legal-entries-from-new-spreadsheet-rows-automatically"
---

# Log legal entries from new spreadsheet rows automatically

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/log-legal-entries-from-new-spreadsheet-rows-automatically. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new row is added to a table in a Microsoft Excel workbook (`excel`, `new_table_row`, New Row in Table).
2. **Filter:** the run continues only if the row has a title and a submission ID. Otherwise it stops and writes nothing.
3. **Zapier Tables** creates one record in the legal entries table: the row's title goes to Title, its submission ID to Submission ID, its notes to Notes, and its priority to Priority.

## Ask the user

Each `REPLACE_…` value in `config.ts` is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | What goes there                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| `WORKBOOK_ID`            | The Excel workbook that holds the intake table; also set the trigger's Workbook field to it   |
| `WORKSHEET_ID`           | The worksheet inside that workbook; also set the trigger's Worksheet field to it              |
| `EXCEL_TABLE_ID`         | The table on that worksheet that new rows come from; also set the trigger's Table field to it |
| `LEGAL_ENTRIES_TABLE_ID` | The Zapier Table that receives one legal entry per row                                        |

Also review the defaults with them: `TITLE_COLUMN`, `SUBMISSION_ID_COLUMN`, `NOTES_COLUMN` and `PRIORITY_COLUMN` are the header names the row is read by. Check them against the sheet's header row.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `excel` (the trigger needs it) to the user's Microsoft Excel connection for the account that owns the tracker, and `zapier-tables` to the user's Zapier Tables connection for the account that owns the legal entries table.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-table-row.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test (`run_workflow_draft` in Zapier MCP) before publishing:

```json
{
  "Title": "[install-test] Vendor NDA renewal",
  "Submission ID": "INTAKE-0001",
  "Notes": "Renewal due next quarter",
  "Priority": "High"
}
```

Check that one new record appears in the legal entries table with the same title, submission ID, notes and priority. Then send a row with no title and check that nothing is created. If run-status tools aren't available, check the result in Zapier Tables directly. Ask the user to delete the test record; the agent doesn't delete test data. Then publish, confirm the trigger is active, and confirm it is on the new table.

## Notes

- Each row creates a new record. The Zap doesn't check for an earlier record with the same submission ID, so a row added twice creates two records.
- The Excel trigger needs the user's own Microsoft Excel connection; without it the trigger can't be set up.
- To escalate high-priority rows, add a notification step for rows with priority set to High, to notify senior counsel. Routing those rows elsewhere is not built here.
- To batch lower-priority intake, collect rows and write them into the tracker hourly instead of one at a time.
