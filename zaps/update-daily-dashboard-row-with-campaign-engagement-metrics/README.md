# Update daily dashboard row with campaign engagement metrics

Every evening, today's engagement numbers are pulled from your analytics endpoint, cleaned into plain numbers and written into today's row of your Google Sheets dashboard, so the team reports from one validated row.

**Apps:** Schedule by Zapier, Webhooks by Zapier, Google Sheets

**Based on:** [Update daily dashboard row with campaign engagement metrics](https://zapier.com/automations/data-analytics/data-visualization/visual-dashboard-updates/update-daily-dashboard-row-with-campaign-engagement-metrics) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-daily-dashboard-row-with-campaign-engagement-metrics

The agent follows `SKILL.md`: it asks you for your analytics endpoint and your dashboard sheet, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`google-sheets`)
- `triggers/`: what starts it
