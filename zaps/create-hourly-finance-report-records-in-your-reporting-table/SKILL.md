---
name: create-hourly-finance-report-records-in-your-reporting-table
description: Build a Zap on Zapier that runs a Salesforce report every hour and writes each row into a central reporting table, creating new records and updating existing ones by a record key. Use when finance or management needs a table of CRM report figures (amount, close date, stage, owner) refreshed on a schedule without manual copying.
license: MIT
metadata:
  author: zapier
  summary: "Every hour, the latest rows from your Salesforce report are written into your reporting table, so finance always sees current figures without copying them by hand."
  apps: "Schedule by Zapier, Salesforce, Zapier Tables"
  category: "Finance"
  job: "Financial reporting"
  source: "https://zapier.com/automations/finance/financial-reporting/management-reporting/create-hourly-finance-report-records-in-your-reporting-table"
---

# Create hourly finance report records in your reporting table

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-hourly-finance-report-records-in-your-reporting-table. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** Schedule by Zapier (`schedule`, `everyHour`), every hour on the hour, every day.
2. **Salesforce** (`salesforce`, `run_report`) runs your report as a tabular report with detail rows, and reads each row's cells in the order of the detail columns.
3. Plain code cleans each row: trims and collapses text, rounds the amount to two decimals, keeps the date as `YYYY-MM-DD`, and builds a record key from account and opportunity.
4. For each row, **Zapier Tables** (`zapier-tables`) looks up the record key in the reporting table. If it finds a match it updates that record, otherwise it creates one. Each row is timestamped in _Synced At_.
5. A failed row is recorded and skipped; the rest still run. The run returns counts of created, updated and failed rows.

The Zap reads the report and writes only to the reporting table.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting              | What goes there                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `REPORT_ID`          | The Salesforce report that feeds finance. Ask which report, then look up its ID with their Salesforce connection.  |
| `REPORTING_TABLE_ID` | The Zapier Table that receives the rows. Ask which table, then look up its ID with their Zapier Tables connection. |

Also review the defaults with them:

- `DETAIL_COLUMNS` in `workflow.ts`: the report's detail columns, in the order they appear in the report. The code reads cells by position: account, opportunity, amount, close date, stage, owner. The last column is a guess (`OWNER_FULL_NAME`), so check it against the report.
- `FIELD_*` in `config.ts`: the reporting table's field keys, in order: Record Key, Account, Opportunity, Amount, Close Date, Stage, Owner, Synced At. The table needs those eight fields (Text, Text, Text, Number, Date & Time, Text, Text, Date & Time).
- `weekends` in `triggers/every-hour.ts`: `"yes"` runs on weekends too.
- `MAX_ROWS` in `workflow.ts`: the most rows processed per run (200).

Before building, confirm that the report's detail columns are in the order above, that the reporting table has the eight fields, and that the record key should be account plus opportunity name (the default here). Salesforce report rows carry no opportunity ID unless the report includes one, so a Salesforce ID would need that column added to the report.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `salesforce` (a connection that can run the report) and `zapier-tables` (the connection that owns the reporting table) to the user's connections. Schedule by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/every-hour.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections before the first test run, check that `DETAIL_COLUMNS` matches the report, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with an empty input. Use a report the user controls, and a test table named `[install-test] Finance reporting table` with the eight fields above.

Check that one row per report line appears in the table, with the amount, close date, stage and owner the report shows. Then run it a second time and check that those rows were updated rather than duplicated. If run-status tools aren't available, check the reporting table directly. Then publish the Zap and confirm the trigger is active, but leave the schedule off until the user is ready for it to run hourly. Ask the user to delete the test data; the agent doesn't delete it.

## Notes

- To keep only qualifying rows (for example closed/won, or one stage), filter them out before the write loop in `workflow.ts`.
- To notify finance, add a step after the loop that sends an email or Slack summary with the created and updated counts.
- The report step needs a Salesforce connection; without one the workflow fails on its first step every hour.
- The record key is account plus opportunity name, so renaming either in Salesforce creates a new row instead of updating the old one.
- Table dates are stored in UTC and shown in the table's own format.
- Keep a real report ID or table ID out of any shared copy of this file.
