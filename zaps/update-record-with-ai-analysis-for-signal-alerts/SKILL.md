---
name: update-record-with-ai-analysis-for-signal-alerts
description: Build a Zap on Zapier that, when a new signal-alert record is added to a Zapier Table, fetches recent price and volume data, has an AI model review the record's strategy text against that data, and writes a verdict and reasoning back to the same record. Use when a trading, monitoring or alerting team triages signals in a table and wants an AI first-pass review on every new alert without manual lookups.
license: MIT
metadata:
  author: zapier
  summary: "When a new signal alert lands in your table, an AI reviews it against your strategy and recent market data and writes a verdict onto the same record, ready for triage."
  apps: "Zapier Tables, Webhooks by Zapier, ChatGPT (OpenAI)"
  category: "Engineering"
  job: "Ml ops AI operations"
  source: "https://zapier.com/automations/engineering/ml-ops-ai-operations/model-monitoring-alerting/update-record-with-ai-analysis-for-signal-alerts"
---

# Update record with AI analysis for signal alerts

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-record-with-ai-analysis-for-signal-alerts. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new record is added to a Zapier Table (`zapier-tables`, `new_record`).
2. **Webhooks by Zapier** sends a GET request to your market-data endpoint and takes the JSON response (trimmed to 20,000 characters).
3. **ChatGPT (OpenAI)** runs a Conversation prompt with the record's strategy text and that market data. It returns a verdict (BUY, SELL, HOLD or INSUFFICIENT DATA) on the first line, then one short paragraph of reasoning.
4. **Zapier Tables** updates the same record: the analysis field gets the verdict and reasoning, and the reviewed-at field gets the time.

Records with an empty strategy field stop early and write nothing.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                     | Where                                                           | What goes there                                                                    |
| --------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `REPLACE_TABLE_ID`          | `config.ts` as `TABLE_ID`; `triggers/new-record.ts`, `table_id` | The table the signal alerts land in                                                |
| `REPLACE_STRATEGY_FIELD`    | `config.ts` as `STRATEGY_FIELD`                                 | The field key holding the strategy text, not its header name                       |
| `REPLACE_ANALYSIS_FIELD`    | `config.ts` as `ANALYSIS_FIELD`                                 | The field key the verdict and reasoning are written to; overwritten on each review |
| `REPLACE_REVIEWED_AT_FIELD` | `config.ts` as `REVIEWED_AT_FIELD`                              | The field key for the time the record was reviewed                                 |
| `REPLACE_MARKET_DATA_URL`   | `config.ts` as `MARKET_DATA_URL`                                | A GET endpoint that returns recent price and volume series as JSON                 |

Also review the default `MODEL` in `config.ts` (`gpt-4o`) with them.

Before building, confirm they accept that strategy text and market data are sent to OpenAI. Ask whether they also want a status value, such as "Reviewed", written with each review; the build writes only the analysis and the timestamp.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `zapier-tables` (the user's Zapier Tables connection, used by the trigger and the update) and `chatgpt` (the user's OpenAI connection) to the user's connections. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-record.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, using a record in a test table the user controls, not production data. Use the strategy field key from the Ask step in place of `REPLACE_STRATEGY_FIELD`:

```json
{
  "id": "<a record ID in the test table>",
  "REPLACE_STRATEGY_FIELD": "Buy when volume doubles against the 20-day average and price holds above the 50-day line."
}
```

Check that the same record's analysis field now holds a verdict on the first line, with a reasoning paragraph, and that its reviewed-at field holds a recent time. No other record should change. If run-status tools aren't available, check the record in Zapier Tables directly. Then publish and confirm the trigger is active. The user deletes the test data, not the agent.

## Notes

- Strategy text and market data are sent to OpenAI. Check that this is acceptable for your data.
- The verdict may vary between runs. Treat it as a first-pass review for triage, not a trading decision.
- To pre-filter on severity, add a check before the AI step. To recheck later, add Delay by Zapier and a repeat fetch that appends follow-up notes. To also set a status, add it to the update step.
- Never commit a real table ID, field key, market-data URL or webhook URL.
