# Update KPI row with CSAT percentage from email

When a PDF report arrives by email, its headline percentage is copied into the matching KPI row of your executive workbook, so the dashboard numbers stay current.

**Apps:** Microsoft Outlook, Microsoft Excel, ChatGPT (OpenAI)

**Based on:** [Update KPI row with CSAT percentage from email](https://zapier.com/automations/data-analytics/business-intelligence/reporting-management/update-kpi-row-with-csat-percentage-from-email-pd-fs) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-kpi-row-with-csat-percentage-from-email-pd-fs

The agent follows `SKILL.md`: it asks you for your KPI workbook, its tab and the two columns to match and fill, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`chatgpt`, `excel`, `microsoft-outlook`)
- `triggers/`: what starts it
