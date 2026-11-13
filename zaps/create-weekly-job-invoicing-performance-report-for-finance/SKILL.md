---
name: create-weekly-job-invoicing-performance-report-for-finance
description: Build a Zap on Zapier that runs every week, counts the jobs closed in the previous seven days in a Zapier Table, and writes the count as an item in a Notion finance database. Use when a finance team wants a weekly closed-jobs and invoicing summary kept in Notion without manual counting.
license: MIT
metadata:
  author: zapier
  summary: "Every week, the jobs closed in the last seven days are counted from your jobs table and logged as a dated item in your finance database in Notion."
  apps: "Schedule by Zapier, Zapier Tables, Notion"
  category: "Finance"
  job: "Financial reporting"
  source: "https://zapier.com/automations/finance/financial-reporting/management-reporting/create-weekly-job-invoicing-performance-report-for-finance"
---

# Create weekly job invoicing performance report for finance

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-weekly-job-invoicing-performance-report-for-finance. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** `schedule`, `everyWeek`, every week on Monday at 9:00 AM in the account timezone.
2. **Date range:** the run date is captured once. The Zap then works out the seven full days before it (the previous week), formatted MM/DD/YY.
3. **Zapier Tables** searches the jobs table once per day in that range (seven lookups), each on the closed-date field.
4. **Count:** the closed jobs found across the seven days are totalled, and any failed days are listed.
5. **Notion** creates one item in the finance database with the period and the counts as its content.

A lookup that fails is recorded in the report and does not stop the others.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                 | What goes there                                                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `TABLE_ID`              | The Zapier Table that holds the jobs. Ask which table, then look up its ID with the user's Zapier Tables connection                             |
| `CLOSED_DATE_FIELD`     | The field key of the closed date in that table. Ask which field holds it, then look up its key with the user's Zapier Tables connection         |
| `LOOKUP_VALUE_FIELD`    | The field key that receives each day's search value. Normally the closed-date field. Not yet verified against a real table, so confirm it first |
| `NOTION_DATA_SOURCE_ID` | The finance database that receives the report. Ask which database, then look up its data source ID with the user's Notion connection            |

Also review the defaults with them: the run day and time in `triggers/every-week.ts` (Monday at 9:00 AM) and `LOOKBACK_DAYS` in `workflow.ts` (7, the previous week).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `zapier-tables` (the account that owns the jobs table) and `notion` (the account that owns the finance database) to the user's connections. Schedule by Zapier needs none.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/every-week.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

The trigger supplies no input, so run the workflow once as a draft test with an empty input. Expect:

- Seven Zapier Tables lookups, one per day, each returning its record IDs.
- One Notion item whose content reads `Closed jobs MM/DD/YY to MM/DD/YY: N. Failed day lookups: none.`

Check that the Notion item exists and that its count matches the jobs in the table for those days. If run-status tools aren't available, check the result in Notion directly. Ask the user to delete the test item, not the agent. Then publish, confirm the trigger is active, and tell the user when the first run is due.

## Notes

- Zapier Tables' Find Records action matches one field against one value and returns only record IDs, so counts by billing methodology and a list of jobs with no invoice number need more reads than this Zap makes.
- The Notion step writes one text summary; the separate number and date properties are not mapped yet.
- To extend it: split the counts by billing methodology, list jobs with no invoice number, post to Slack when that list is over a limit, or write a CSV archive before the Notion item is created.
- Keep real table IDs and Notion data source IDs out of commits.
