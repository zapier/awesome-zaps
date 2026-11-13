# Increment company engagement totals from incoming marketing emails

Each marketing email engagement adds one to the engagement count of the company it belongs to, so campaign managers see who is engaging most.

**Apps:** HubSpot, Zapier Tables

**Based on:** [Increment company engagement totals from incoming marketing emails](https://zapier.com/automations/data-analytics/analytics-automation/customer-analytics/increment-company-engagement-totals-from-incoming-marketing-emails) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/increment-company-engagement-totals-from-incoming-marketing-emails

The agent follows `SKILL.md`: it asks you which Zapier Table holds the engagement counts, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`hubspot`, `zapier-tables`)
- `triggers/`: what starts it
