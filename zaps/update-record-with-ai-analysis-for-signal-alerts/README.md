# Update record with AI analysis for signal alerts

When a new signal alert lands in your table, an AI reviews it against your strategy and recent market data and writes a verdict onto the same record, ready for triage.

**Apps:** Zapier Tables, Webhooks by Zapier, ChatGPT (OpenAI)

**Based on:** [Update record with AI analysis for signal alerts](https://zapier.com/automations/engineering/ml-ops-ai-operations/model-monitoring-alerting/update-record-with-ai-analysis-for-signal-alerts) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-record-with-ai-analysis-for-signal-alerts

The agent follows `SKILL.md`: it asks you for the table that holds your signal alerts, the columns for the strategy text, verdict and reviewed-at time, and your market-data endpoint, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`chatgpt`, `zapier-tables`)
- `triggers/`: what starts it
