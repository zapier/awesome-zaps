# Create loan application records from social lead forms

Each new Facebook lead form submission becomes a loan application record in your Airtable intake table, with a readable timestamp, a cleaned-up phone number and revenue figure, campaign details and a source tag.

**Apps:** Facebook Lead Ads, Airtable

**Based on:** [Create loan application records from social lead forms](https://zapier.com/automations/finance/loan-management/loan-application-processing/create-loan-application-records-from-social-lead-forms) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-loan-application-records-from-social-lead-forms

The agent follows `SKILL.md`: it asks you which Facebook Page and lead form start it and which Airtable base and table hold the applications, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`airtable`, `facebook-lead-ads`)
- `triggers/`: what starts it
