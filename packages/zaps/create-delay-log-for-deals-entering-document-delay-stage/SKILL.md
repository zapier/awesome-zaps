---
name: create-delay-log-for-deals-entering-document-delay-stage
description: Build a Zapier Next Gen Zap that logs a row in a Zapier Table each time a Pipedrive deal moves into the document delay stage, so the team can triage and resolve paperwork holds. Use when a sales team tracks deals stuck on documents and wants every entry into that stage recorded in one place without manual logging.
metadata:
  author: zapier
  summary: "When a deal moves into the document delay stage, a row is added to your delay log with the deal, the time and an open triage flag, so nothing stuck on paperwork goes unnoticed."
  apps: "Pipedrive, Zapier Tables"
  category: "Sales"
  job: "Pipeline management"
  source: "https://zapier.com/automations/sales/pipeline-management/deal-tracking/create-delay-log-for-deals-entering-document-delay-stage"
---

# Create delay log for deals entering document delay stage

## What it does

1. **Trigger:** a Pipedrive deal's stage is updated (Pipedrive, Updated Deal Stage).
2. The workflow stops unless the deal moved into the document-delay stage you set.
3. **Zapier Tables** looks for a row with the same deal ID. If one exists, the run stops and writes nothing, so each deal gets one log row.
4. **Zapier Tables** creates a row: the deal ID, the update time from Pipedrive, the stage ID as the delay status, and `Open` in the triage status column.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Pipedrive, Updated Deal Stage (`pipedrive`, `updated_deal_stage_v3`). Leave its stage parameter empty; the workflow filters on the stage itself, so it works with any stage picker.
2. **Connections** (each alias in the code is the app's slug):
   - `pipedrive`: the user's Pipedrive connection, for the account that owns the deals.
   - `zapier-tables`: the user's Zapier Tables connection.
3. **Table:** create a table with four columns, in this order: `Deal ID` (Text), `Updated at` (Date & Time), `Delay status` (Text), `Triage status` (Text). Use its ID for the table constant.
4. **Constants:**
   - `DELAY_STAGE_ID`: the Pipedrive stage ID of the document-delay stage.
   - `DELAY_LOG_TABLE_ID`: the ID of the Zapier Table that holds the log.
   - `INITIAL_TRIAGE_STATUS`: the text put in each new row's triage column. Defaults to `"Open"`.
5. Publish, wait until the trigger is active, and confirm the trigger on the workflow page.

## Ask the user

- Which Pipedrive stage is the document-delay stage? Its ID goes in `DELAY_STAGE_ID`.
- Which Zapier Table holds the delay log, and do its columns match the four above?
- Should the triage status start at something other than `Open`?

## Test

Run this sample as a draft test run before publishing, with a deal ID that is not yet in the log and the stage ID you set:

```json
{
  "id": "1001",
  "stage_id": "YOUR_DELAY_STAGE_ID",
  "update_time": "2026-10-29T10:15:00Z"
}
```

Confirm that the log gained one row for that deal, with the update time, the stage in delay status, and `Open` in triage status. Run it again with the same deal ID and confirm no second row appears. Then delete the test row if it was real data.

## Customize

- **Only log some pipelines or deal types:** add a check on the deal's pipeline or type before the lookup step.
- **Flag high-value deals for expedited triage:** add a check on the deal's value and write a higher-priority triage status for deals above your threshold.

## Notes

- Each deal gets one log row. A deal that re-enters the delay stage later does not add a second row.
- Zapier Tables shows the update time in the table's own format and time zone.
- Never commit a real table ID or stage ID to a shared copy of this workflow.
