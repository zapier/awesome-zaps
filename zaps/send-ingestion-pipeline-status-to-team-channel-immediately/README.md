# Send ingestion pipeline status to team channel immediately

When an ingestion pipeline reports a finished run or any errors, a short success and failure summary lands in your team's Slack channel right away.

**Apps:** Webhooks by Zapier, Slack

**Based on:** [Send ingestion pipeline status to team channel immediately](https://zapier.com/automations/data-analytics/etl-management/pipeline-monitoring-alerting/send-ingestion-pipeline-status-to-team-channel-immediately) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-ingestion-pipeline-status-to-team-channel-immediately

The agent follows `SKILL.md`: it asks you which Slack channel gets the summary, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`slack`)
- `triggers/`: what starts it
