# Send real-time vendor alerts to crisis team inbox

When a vendor row in your tracking sheet is flagged as an alert, your crisis team gets an email with the details and a link to the row.

**Apps:** Google Sheets, Microsoft Outlook

**Based on:** [Send real time vendor alerts to crisis team inbox](https://zapier.com/automations/executives/crisis-incident-management/crisis-communication-distribution/send-real-time-vendor-alerts-to-crisis-team-inbox) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-real-time-vendor-alerts-to-crisis-team-inbox

The agent follows `SKILL.md`: it asks you for your vendor tracker sheet, the crisis team inbox and the Outlook account that sends the alerts, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-sheets`, `microsoft-outlook`)
- `triggers/`: what starts it
