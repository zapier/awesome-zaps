# Log model evaluation metrics to central results sheet

When a prediction batch arrives, it is scored against your targets file in Google Drive, and its total and high-error RMSE are added as a row in your central results sheet for review.

**Apps:** Webhooks by Zapier, Google Drive, Google Sheets

**Based on:** [Log model evaluation metrics to central results sheet](https://zapier.com/automations/engineering/ml-ops-ai-operations/model-monitoring-alerting/log-model-evaluation-metrics-to-central-results-sheet) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/log-model-evaluation-metrics-to-central-results-sheet

The agent follows `SKILL.md`: it asks you for the targets file in Google Drive and the results sheet, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-drive`, `google-sheets`)
- `triggers/`: what starts it
