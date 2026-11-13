# Create parsed lead rows from incoming customer emails

Each new lead email in your Outlook folder becomes a row in your lead sheet, with the date and a short summary, so triage starts from one list.

**Apps:** Microsoft Outlook, Google Sheets

**Based on:** [Create parsed lead rows from incoming customer emails](https://zapier.com/automations/marketing/lead-management/lead-generation/create-parsed-lead-rows-from-incoming-customer-emails) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-parsed-lead-rows-from-incoming-customer-emails

The agent follows `SKILL.md`: it asks you for the lead sheet, the Outlook folder to watch and the words that mark a lead, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-sheets`, `microsoft-outlook`)
- `triggers/`: what starts it
