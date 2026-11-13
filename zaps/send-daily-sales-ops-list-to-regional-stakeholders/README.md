# Send daily sales ops list to regional stakeholders

Every weekday morning, the day's sales ops worksheet is found in your Drive folder and emailed to your regional stakeholders, with the ops owner copied, so everyone starts standup with the same list.

**Apps:** Schedule by Zapier, Google Drive, Microsoft Outlook

**Based on:** [Send daily sales ops list to regional stakeholders](https://zapier.com/automations/data-analytics/business-intelligence/report-distribution/send-daily-sales-ops-list-to-regional-stakeholders) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-daily-sales-ops-list-to-regional-stakeholders

The agent follows `SKILL.md`: it asks you for the worksheet's Drive folder and title, the stakeholder and ops owner emails, the sending Outlook account and the morning time, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-drive`, `microsoft-outlook`)
- `triggers/`: what starts it
