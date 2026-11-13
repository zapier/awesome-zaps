---
name: create-delay-log-for-deals-entering-document-delay-stage
description: Build a Zap on Zapier that logs a row in a Zapier Table each time a Pipedrive deal moves into the document delay stage, so the team can triage and resolve paperwork holds. Use when a sales team tracks deals stuck on documents and wants every entry into that stage recorded in one place without manual logging.
license: MIT
metadata:
  author: zapier
  summary: "When a deal moves into the document delay stage, a row is added to your delay log with the deal, the time and an open triage flag, so nothing stuck on paperwork goes unnoticed."
  apps: "Pipedrive, Zapier Tables"
  category: "Sales"
  job: "Pipeline management"
  source: "https://zapier.com/automations/sales/pipeline-management/deal-tracking/create-delay-log-for-deals-entering-document-delay-stage"
---

# Create delay log for deals entering document delay stage

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-delay-log-for-deals-entering-document-delay-stage. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Pipedrive deal's stage is updated (Pipedrive, Updated Deal Stage: `pipedrive`, `updated_deal_stage_v3`). Its stage setting is left empty, because the workflow filters on the stage itself.
2. The workflow stops unless the deal moved into the document-delay stage set in `DELAY_STAGE_ID`.
3. **Zapier Tables** looks for a row with the same deal ID. If one exists, the run stops and writes nothing.
4. **Zapier Tables** creates a row: the deal ID, the update time from Pipedrive, the stage ID as the delay status, and `Open` in the triage status column.

Each deal gets one log row, so a deal that re-enters the delay stage later adds nothing.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting              | What goes there                                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DELAY_STAGE_ID`     | The Pipedrive stage that holds deals waiting on documents. Look it up with the user's Pipedrive connection; deals moving into any other stage are skipped.                                                                     |
| `DELAY_LOG_TABLE_ID` | The Zapier Table that holds the delay log. Its columns, in order, must be `Deal ID` (Text), `Updated at` (Date & Time), `Delay status` (Text) and `Triage status` (Text). Look it up with the user's Zapier Tables connection. |

Also review the default with them: `INITIAL_TRIAGE_STATUS` (`"Open"`) is the text written to each new row's Triage status column. Ask whether they want new deals to start at something else.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `zapier-tables` to the user's Zapier Tables connection, which holds the delay log. The trigger uses `pipedrive`, the user's Pipedrive connection for the account that owns the deals.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-deal-stage.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a deal ID that is not yet in the log, and with `stage_id` set to the `DELAY_STAGE_ID` you chose so the run is not skipped:

```json
{
  "id": "1001",
  "stage_id": "5",
  "update_time": "2026-10-29T10:15:00Z"
}
```

Check that the log gained one row for that deal, with the update time, the stage in Delay status, and `Open` in Triage status. Run it again with the same deal ID and check that no second row appears. If run-status tools aren't available, check the result in Zapier Tables directly. Ask the user to delete the test rows; the agent does not delete data. Then publish, and confirm the trigger is active.

## Notes

- Zapier Tables shows the update time in the table's own format and time zone.
- To log only some pipelines or deal types, add a check on the deal's pipeline or type before the lookup step.
- To flag high-value deals for expedited triage, add a check on the deal's value and write a higher-priority status for deals above the threshold.
- Never commit a real table ID or stage ID to a shared copy of this workflow.
