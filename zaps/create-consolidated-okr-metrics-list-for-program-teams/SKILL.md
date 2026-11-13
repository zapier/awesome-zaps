---
name: create-consolidated-okr-metrics-list-for-program-teams
description: Build a Zap on Zapier that collects every OKR metric record from an Airtable table, removes empty and duplicate record IDs, and returns one comma-separated list for program-team reporting. Use when a product operations team tracks OKR metrics in Airtable and needs a single consolidated ID list for downstream zaps or reports.
license: MIT
metadata:
  author: zapier
  summary: "Gathers all of your OKR metric records from Airtable into one clean list of record IDs that reporting jobs can use."
  apps: "Airtable"
  category: "Product"
  job: "Product operations"
  source: "https://zapier.com/automations/product/product-operations/product-okr-tracking/create-consolidated-okr-metrics-list-for-program-teams"
---

# Create consolidated OKR metrics list for program teams

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-consolidated-okr-metrics-list-for-program-teams. Read the files there if this skill was installed on its own.

## What it does

1. **Start:** no trigger. The Zap runs on demand, started by hand or called from another Zap that needs the list.
2. **Airtable** reads every record from the OKR metrics table, across all pages of results.
3. The Zap drops empty and duplicate record IDs, then returns one comma-separated string of the remaining IDs, with a count.

The Zap only reads from Airtable and never changes the table.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting    | What goes there                                                              |
| ---------- | ---------------------------------------------------------------------------- |
| `BASE_ID`  | The Airtable base that holds the OKR metrics (its ID starts with `app`)      |
| `TABLE_ID` | The table in that base that holds the OKR metrics (its ID starts with `tbl`) |

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `airtable` to the user's Airtable connection for the account that owns the OKR metrics base.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `connections/` is a setting, not code: set the workflow's connection binding from it. This zap has no `triggers/` folder, so it has no trigger and is published as on-demand.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the Airtable action's fields with the user's connection before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once with no input. Check that `recordIds` lists each metric record's ID once, separated by commas, and that `count` matches the number of IDs. Compare the count with the number of records in the table.

If run-status tools aren't available, check the result against the table in Airtable directly. The Zap doesn't write to Airtable, so there is no test data to clean up; if you add test records to the table, the user deletes them, not the agent.

## Notes

- The record IDs come back as one comma-separated string. For very large tables, consider returning a list instead.
- A table with no records returns `skipped: true` with an empty list, so downstream steps can stop cleanly.
- To return full records (metric name and objective fields) instead of IDs, or only metrics updated within a recent window, change the Airtable step's inputs and the returned value in `workflow.ts`.
- Don't commit a real base or table ID to a shared copy of this Zap.
