# Update case records with discovery and BWC statuses

When an evidence intake update arrives, the matching case record in Airtable gets its Discovery and BWC statuses, timestamps and activity log, and a KPI entry is logged for each track.

**Apps:** Webhooks by Zapier, Airtable

**Based on:** [Update case records with discovery and BWC statuses](https://zapier.com/automations/legal/e-discovery-litigation-support/litigation-timeline-tracking/update-case-records-with-discovery-and-bwc-statuses) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-case-records-with-discovery-and-bwc-statuses

The agent follows `SKILL.md`: it asks you for your Airtable base and its case and KPI tables, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`airtable`)
- `triggers/`: what starts it
