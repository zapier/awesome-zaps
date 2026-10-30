---
name: create-hourly-finance-report-records-in-your-reporting-table
description: Build a Zapier Next Gen Zap that runs a Salesforce report every hour and writes each row into a central reporting table, creating new records and updating existing ones by a record key. Use when finance or management needs a table of CRM report figures (amount, close date, stage, owner) refreshed on a schedule without manual copying.
metadata:
  author: zapier
  summary: "Every hour, the latest rows from your Salesforce report are written into your reporting table, so finance always sees current figures without copying them by hand."
  apps: "Schedule by Zapier, Salesforce, Zapier Tables"
  category: "Finance"
  job: "Financial reporting"
  source: "https://zapier.com/automations/finance/financial-reporting/management-reporting/create-hourly-finance-report-records-in-your-reporting-table"
---

# Create hourly finance report records in your reporting table

## What it does

1. **Trigger:** Schedule by Zapier, every hour on the hour, every day.
2. **Salesforce** runs your report (`run_report`, tabular, with detail rows) and reads each row's cells in the order of the detail columns.
3. Plain code cleans each row: trims and collapses text, rounds the amount to two decimals, keeps the date as `YYYY-MM-DD`, and builds a record key from account and opportunity.
4. For each row, **Zapier Tables** looks up the record key in the reporting table. If it finds a match it updates that record, otherwise it creates one. Each row is timestamped in _Synced At_.
5. A failed row is recorded and skipped; the rest still run. The run returns counts of created, updated and failed rows.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Schedule by Zapier, `everyHour` (`schedule`, no connection, `authentication_id` `null`). Params: `weekends: "yes"`. The time offset defaults to the top of the hour and the timezone to the account's.
2. **Connections** (each alias in the code is the app's slug):
   - `salesforce`: a Salesforce connection for the account that can run the report.
   - `zapier-tables`: the Zapier Tables connection that owns the reporting table.
3. **Constants:**
   - `REPORT_ID`: the Salesforce report's ID (from the report's URL).
   - `DETAIL_COLUMNS`: the report's detail columns, in the order they appear in the report. The code reads cells by position: account, opportunity, amount, close date, stage, owner. The last column is a guess (`OWNER_FULL_NAME`); check it against the report.
   - `REPORTING_TABLE_ID`: the Zapier Table's ID.
   - `FIELD_*`: the reporting table's field keys, in order: Record Key, Account, Opportunity, Amount, Close Date, Stage, Owner, Synced At. Create the table with those eight fields (Text, Text, Text, Number, Date & Time, Text, Text, Date & Time).
   - `MAX_ROWS`: the most rows processed per run (200).

## Ask the user

- Which Salesforce report feeds finance, and which of its columns are the account, opportunity, amount, close date, stage and owner, in order?
- Which Zapier Table should receive the rows, and does it have the eight fields above?
- Should the record key be the account and opportunity name (the default here), or a Salesforce ID? Salesforce report rows carry no opportunity ID unless the report includes one.
- Should a run ever be reduced to qualifying rows (closed/won or a stage)? That is a Customize item, not built.

## Test

The check that was run:

- Created a test table, `[install-test] Finance reporting table`, with the eight fields.
- Wrote one test row through the Create Record action, found it again by its record key, then changed its stage and amount with Update Record. All three calls returned the expected values.

To test the full workflow, connect Salesforce, set `REPORT_ID` and `REPORTING_TABLE_ID`, then run the draft with an empty input. Confirm that one row per report line appears in the table with the amount, close date, stage and owner you expect, and that a second run updates those rows instead of duplicating them. Then disable the schedule until you are ready for it to run hourly.

## Customize

- **Filter rows:** keep only qualifying rows (for example closed/won, or one stage) before the write loop.
- **Notify finance:** send an email or Slack summary after each run with the created and updated counts.

## Notes

- The report step needs a Salesforce connection; without one the workflow fails on its first step every hour.
- The record key is account plus opportunity name, so renaming either in Salesforce creates a new row instead of updating the old one.
- Table dates are stored in UTC and shown in the table's own format.
- Never commit a real report ID or table ID into a shared copy of this file.
