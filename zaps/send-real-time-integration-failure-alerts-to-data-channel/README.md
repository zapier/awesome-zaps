# Send real-time integration failure alerts to data channel

When one of your Zaps fails, a short alert with its name, the error and a link to its history lands in your data channel right away.

**Apps:** Zapier Manager, Slack

**Based on:** [Send real-time integration failure alerts to data channel](https://zapier.com/automations/data-analytics/etl-management/pipeline-monitoring-alerting/send-real-time-integration-failure-alerts-to-data-channel) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-real-time-integration-failure-alerts-to-data-channel

The agent follows `SKILL.md`: it asks you which Slack channel gets the alerts, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`slack`, `zapier-manager`)
- `triggers/`: what starts it
