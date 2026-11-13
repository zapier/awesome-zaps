# Create weight log record from client SMS messages

When a client texts in their weight, it's logged as a timestamped row in your central table and they get a short text back confirming it.

**Apps:** Quo, Zapier Tables

**Based on:** [Create weight log record from client SMS messages](https://zapier.com/automations/personal-productivity/health-wellness-tracking/fitness-tracking-automation/create-weight-log-record-from-client-sms-messages) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-weight-log-record-from-client-sms-messages

The agent follows `SKILL.md`: it asks you for the Quo number clients text and the Zapier Table that holds your weight log, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`quo`, `zapier-tables`)
- `triggers/`: what starts it
