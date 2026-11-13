# Update strategic plan records from daily OKR snapshot

Every morning, each OKR goal is copied into its Strategic Plan record in Salesforce, so roadmap owners always see current progress.

**Apps:** Schedule by Zapier, Webhooks by Zapier, Salesforce

**Based on:** [Update strategic plan records from daily OKR snapshot](https://zapier.com/automations/executives/strategy-planning/okr-goal-tracking/update-strategic-plan-records-from-daily-okr-snapshot) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-strategic-plan-records-from-daily-okr-snapshot

The agent follows `SKILL.md`: it asks you for your OKR endpoint URL and your Salesforce Strategic Plan field names, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`salesforce`)
- `triggers/`: what starts it
