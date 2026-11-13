# Post daily sales report to central team chat

Each daily sales form submission is turned into a short plain-text summary and posted to your team chat channel, so the central team sees the day's numbers right away.

**Apps:** Google Forms, Slack

**Based on:** [Post daily sales report to central team chat](https://zapier.com/automations/sales/sales-reporting/sales-performance-tracking/post-daily-sales-report-to-central-team-chat) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/post-daily-sales-report-to-central-team-chat

The agent follows `SKILL.md`: it asks you for your daily sales report form, its question titles and the Slack channel that gets the summary, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-forms`, `slack`)
- `triggers/`: what starts it
