# Create ad conversion events for new list contacts

When a contact joins your HubSpot marketing list, a LinkedIn conversion event is sent for them, so campaigns can credit the sign-up.

**Apps:** HubSpot, LinkedIn Conversions

**Based on:** [Create ad conversion events for new list contacts](https://zapier.com/automations/marketing/marketing-analytics/marketing-attribution/create-ad-conversion-events-for-new-list-contacts) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-ad-conversion-events-for-new-list-contacts

The agent follows `SKILL.md`: it asks you which HubSpot list, LinkedIn ad account and conversion to use, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`hubspot`, `linkedin-conversions`)
- `triggers/`: what starts it
