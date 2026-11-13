# Update analytics profiles when contact territory value changes

When a contact's territory changes in your CRM, their analytics profile row is updated (or created) with the new territory, so segments and reports stay accurate.

**Apps:** HubSpot, Google Sheets

**Based on:** [Update analytics profiles when contact territory value changes](https://zapier.com/automations/data-analytics/analytics-automation/customer-analytics/update-analytics-profiles-when-contact-territory-value-changes) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-analytics-profiles-when-contact-territory-value-changes

The agent follows `SKILL.md`: it asks you for the HubSpot territory property and the profiles sheet with its columns, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-sheets`, `hubspot`)
- `triggers/`: what starts it
