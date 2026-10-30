---
name: create-consolidated-okr-metrics-list-for-program-teams
description: Build a Zapier Next Gen Zap that collects every OKR metric record from an Airtable table, removes empty and duplicate record IDs, and returns one comma-separated list for program-team reporting. Use when a product operations team tracks OKR metrics in Airtable and needs a single consolidated ID list for downstream zaps or reports.
metadata:
  author: zapier
  summary: "Gathers all of your OKR metric records from Airtable into one clean list of record IDs that reporting jobs can use."
  apps: "Airtable"
  category: "Product"
  job: "Product operations"
  source: "https://zapier.com/automations/product/product-operations/product-okr-tracking/create-consolidated-okr-metrics-list-for-program-teams"
---

# Create consolidated OKR metrics list for program teams

## What it does

1. **Trigger:** none. The workflow runs on demand: started by hand, or called from another workflow that needs the list.
2. **Airtable** reads every record from the OKR metrics table, across all pages of results.
3. The workflow drops empty IDs and duplicate IDs, then returns one comma-separated string of the remaining record IDs, with a count.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Start:** no trigger. Run it on demand (`run_workflow`), or call it from another workflow.
2. **Connections** (each alias in the code is the app's slug):
   - `airtable`: the user's Airtable connection, for the account that owns the OKR metrics base.
3. **Constants:**
   - `BASE_ID`: the Airtable base ID, which starts with `app`. Copy it from the base's URL.
   - `TABLE_ID`: the Airtable table ID, which starts with `tbl`. Copy it from the table's URL.

## Ask the user

- Which Airtable base and table hold the OKR metrics, and which view should they come from?
- Should the output be record IDs only (the default), or full records with the metric name and objective fields?
- Should the list be limited to metrics updated within a recent time window?

## Test

Run the workflow with no input. Check that `recordIds` lists each metric record's ID once, separated by commas, and that `count` matches the number of IDs. Compare the count with the number of records in the table.

## Customize

- **Return full records:** return the metric name and objective fields for each record, not just IDs.
- **Recent changes only:** limit results to metrics updated within a recent time window.

## Notes

- Record IDs are returned as one comma-separated string. For large tables, consider returning a list instead.
- A table with no records returns `skipped: true` with an empty list, so downstream steps can stop cleanly.
- Never commit a real base or table ID to a shared copy of this workflow.
