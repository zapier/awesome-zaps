# Send monthly compliance reminders to your staff roster via email

On the first of each month, every person on your staff roster gets the compliance reminder with the policy files attached, so HR can collect confirmations before the deadline.

**Apps:** Schedule by Zapier, Google Sheets, Microsoft Outlook

**Based on:** [Send monthly compliance reminders to your staff roster via email](https://zapier.com/automations/human-resources-hr/hr-compliance/policy-distribution/send-monthly-compliance-reminders-to-your-staff-roster-via-email) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-monthly-compliance-reminders-to-your-staff-roster-via-email

The agent follows `SKILL.md`: it asks you for your staff roster sheet, the To address, and when and what to send, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-sheets`, `microsoft-outlook`)
- `triggers/`: what starts it
