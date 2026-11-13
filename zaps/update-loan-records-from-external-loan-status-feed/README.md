# Update loan records from external loan status feed

When the loan servicer sends a status change, the matching loan in your CRM is updated with the new status, dates, property and finance figures, so the team sees current loan data.

**Apps:** Webhooks by Zapier, Salesforce

**Based on:** [Update loan records from external loan status feed](https://zapier.com/automations/finance/loan-management/loan-servicing/update-loan-records-from-external-loan-status-feed) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-loan-records-from-external-loan-status-feed

The agent follows `SKILL.md`: it asks you for your Salesforce loan object and the fields that hold the loan ID, status, property, balance, rate and dates, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`salesforce`)
- `triggers/`: what starts it
