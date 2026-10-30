---
name: create-weekly-job-invoicing-performance-report-for-finance
description: Build a Zapier Next Gen Zap that runs every week, counts the jobs closed in the previous seven days in a Zapier Table, and writes the count as an item in a Notion finance database. Use when a finance team wants a weekly closed-jobs and invoicing summary kept in Notion without manual counting.
metadata:
  author: zapier
  summary: "Every week, the jobs closed in the last seven days are counted from your jobs table and logged as a dated item in your finance database in Notion."
  apps: "Schedule by Zapier, Zapier Tables, Notion"
  category: "Finance"
  job: "Financial reporting"
  source: "https://zapier.com/automations/finance/financial-reporting/management-reporting/create-weekly-job-invoicing-performance-report-for-finance"
---

# Create weekly job invoicing performance report for finance

## What it does

1. **Trigger:** Schedule by Zapier, every week on Monday at 9:00 AM in the account timezone.
2. **Date range:** the run date is captured once. The workflow then works out the seven full days before it (the previous week), formatted MM/DD/YY.
3. **Zapier Tables** searches the jobs table once per day in that range (seven lookups), each on the closed-date field. A lookup that fails is recorded and does not stop the others.
4. **Count:** the closed jobs found across the seven days are totalled, and the failed days are listed.
5. **Notion** creates one item in the finance database with the period and the counts as its content.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Schedule by Zapier, `everyWeek` (`schedule`). It needs no connection, so its `authentication_id` is `null`. Params: `dow: ["0"]` (Monday), `hod: "9:00 AM"`.
2. **Connections** (each alias in the code is the app's slug):
   - `zapier-tables`: the Zapier Tables connection that owns the jobs table.
   - `notion`: the Notion connection that owns the finance database.
3. **Constants:**
   - `TABLE_ID`: the Zapier Tables table ID of the jobs table.
   - `CLOSED_DATE_FIELD`: the field key of the closed date in that table.
   - `LOOKUP_VALUE_FIELD`: the field key that receives the search value. Placeholder; confirm against the real table before use.
   - `NOTION_DATA_SOURCE_ID`: the data source ID of the finance database.
   - `LOOKBACK_DAYS`: `7`, the number of full days counted before the run date.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user when the first run is due.

## Ask the user

- Which Zapier Table holds the jobs, and which fields hold the closed date, the billing methodology and the invoice number?
- Which Notion database receives the report, and which of its properties should hold the report date and the counts?
- Should the report run on a day other than Monday at 9:00 AM, or in a timezone other than the account's?

## Test

When the constants are filled in and a test connection is available, run the workflow as a draft test run (`run_workflow_draft` in Zapier MCP) with an empty input, since the trigger supplies none. Expect:

- Seven Zapier Tables lookups, one per day, each returning its record IDs.
- One Notion item whose content reads `Closed jobs MM/DD/YY to MM/DD/YY: N. Failed day lookups: none.`

Confirm the Notion item exists and that its count matches the jobs in the table for those days. Delete the test item afterwards.

## Customize

- **Billing methodology split:** count jobs by billing methodology, not just in total.
- **Uninvoiced pending list:** list the jobs with no invoice number. Needs the same field reads.
- **Threshold alert:** add a Slack message or digest when the pending list is over a limit.
- **CSV export:** write the counts to a CSV before the Notion item is created, for an external archive.

## Notes

- Zapier Tables' Find Records action matches one field against one value, and returns only record IDs. The spec's counts by billing methodology and the pending invoice list cannot be built from it alone.
- The Notion step writes a single text summary. The spec's separate number and date properties are not mapped yet.
- Never commit a real table ID, Notion data source ID or webhook URL.
