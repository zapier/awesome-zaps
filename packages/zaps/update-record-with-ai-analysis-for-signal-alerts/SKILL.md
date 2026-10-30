---
name: update-record-with-ai-analysis-for-signal-alerts
description: Build a Zapier Next Gen Zap that, when a new signal-alert record is added to a Zapier Table, fetches recent price and volume data, has an AI model review the record's strategy text against that data, and writes a verdict and reasoning back to the same record. Use when a trading, monitoring or alerting team triages signals in a table and wants an AI first-pass review on every new alert without manual lookups.
metadata:
  author: zapier
  summary: "When a new signal alert lands in your table, an AI reviews it against your strategy and recent market data and writes a verdict onto the same record, ready for triage."
  apps: "Zapier Tables, Webhooks by Zapier, ChatGPT (OpenAI)"
  category: "Engineering"
  job: "Ml ops AI operations"
  source: "https://zapier.com/automations/engineering/ml-ops-ai-operations/model-monitoring-alerting/update-record-with-ai-analysis-for-signal-alerts"
---

# Update record with AI analysis for signal alerts

## What it does

1. **Trigger:** a new record is added to a Zapier Table (`zapier-tables` New Record, `new_record`).
2. **Webhooks by Zapier** sends a GET request to your market-data endpoint and takes the JSON response (trimmed to 20,000 characters).
3. **ChatGPT (OpenAI)** runs a Conversation prompt with the record's strategy text and that market data. It returns a verdict (BUY, SELL, HOLD or INSUFFICIENT DATA) on the first line, then one short paragraph of reasoning.
4. **Zapier Tables** updates the same record: the analysis field gets the verdict and reasoning, and the reviewed-at field gets the time.

Records with an empty strategy field stop early and write nothing.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Zapier Tables, New Record (`Zapier Tables@<version>` / `new_record`), with `table_id` set to your table. It needs your Zapier Tables connection.
2. **Connections** (each alias in the code is the app's slug):
   - `zapier-tables`: the user's Zapier Tables connection. It serves both the trigger and the update.
   - `chatgpt`: the user's OpenAI connection, authorized through Zapier MCP.
   - `webhook`: no connection (no-auth app), so no alias binding.
3. **Constants:**
   - `TABLE_ID`: the table the alerts land in.
   - `STRATEGY_FIELD`: the field key holding the strategy text, not its header name.
   - `ANALYSIS_FIELD`: the field key the verdict and reasoning are written to.
   - `REVIEWED_AT_FIELD`: the field key for the reviewed-at time.
   - `MARKET_DATA_URL`: a GET endpoint returning recent price and volume series as JSON.
   - `MODEL`: the OpenAI model. Defaults to `gpt-4o`.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the trigger's webhook URL if one is shown.

## Ask the user

- Which table holds the signal alerts, and which field keys hold the strategy text, the analysis, and the reviewed-at time?
- What is the market-data endpoint? It must be a GET endpoint that returns recent price and volume series as JSON.
- Should the record also get a status value (for example "Reviewed") when the review is written? The build writes only the analysis and the timestamp.
- Which OpenAI model should be used? The build defaults to `gpt-4o`.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, using a record that exists in the user's table. Use a test table, not production data:

```json
{
  "id": "YOUR_RECORD_ID",
  "YOUR_STRATEGY_FIELD_KEY": "Buy when volume doubles against the 20-day average and price holds above the 50-day line."
}
```

Confirm that the same record's analysis field now holds a verdict on the first line, with a reasoning paragraph, and that its reviewed-at field holds a recent time. No other record should change.

## Customize

- **Pre-filter on severity:** add a check before the AI step so only qualifying alerts continue.
- **Staged rechecks:** add Delay by Zapier and a repeat fetch to recheck later and append follow-up notes.

## Notes

- Strategy text and market data are sent to OpenAI. Check that this is acceptable for your data.
- The model's output may vary between runs. Treat the verdict as a first-pass review for triage, not a trading decision.
- Never commit a real table ID, field key, market-data URL or webhook URL.
