# Send scheduled welcome email and update visitor status

When a visitor's row in your Zapier Table reaches the milestone you set, they get a welcome email and their row moves to the next stage, with the send time recorded.

**Apps:** Zapier Tables, Gmail

**Based on:** [Send scheduled welcome email and update visitor status](https://zapier.com/automations/customer-service-success/customer-onboarding/customer-welcome-sequences/send-scheduled-welcome-email-and-update-visitor-status) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-scheduled-welcome-email-and-update-visitor-status

The agent follows `SKILL.md`: it asks you which table holds your visitors and what the welcome email says, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `zapier-tables`)
- `triggers/`: what starts it
