# Send brand color palette to requesting user and log it

When someone asks for the brand colors with a slash command, they get the palette posted back in Slack and the request is logged in Airtable for tracking.

**Apps:** Webhooks by Zapier, Airtable, Slack

**Based on:** [Send brand color palette to requesting user and log it](https://zapier.com/automations/design/brand-management/brand-guidelines-distribution/send-brand-color-palette-to-requesting-user-and-log-it) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-brand-color-palette-to-requesting-user-and-log-it

The agent follows `SKILL.md`: it asks you for the Airtable base and table that log requests, the Slack channel that gets the palette and your brand's colors, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`airtable`, `slack`)
- `triggers/`: what starts it
