# Create searchable case log from incoming support emails

Every new support email gets its own row in a Google Sheet, with the sender, subject, a short summary and any order or ticket number it mentions, so the team can search and triage cases in one place.

**Apps:** Gmail, Google Sheets

**Based on:** [Create searchable case log from incoming support emails](https://zapier.com/automations/customer-service-success/omnichannel-support/email-to-ticket-conversion/create-searchable-case-log-from-incoming-support-emails) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-searchable-case-log-from-incoming-support-emails

The agent follows `SKILL.md`: it asks you for the support inbox label to watch and the sheet that holds the case log, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `google-sheets`)
- `triggers/`: what starts it
