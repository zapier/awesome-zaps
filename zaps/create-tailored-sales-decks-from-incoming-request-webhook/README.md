# Create tailored sales decks from incoming request webhook

When a sales request comes in, a tailored deck is built from a template with the client's details and saved for the deal team, and repeat requests are skipped.

**Apps:** Webhooks by Zapier, Storage by Zapier, Zapier Tables, Google Slides

**Based on:** [Create tailored sales decks from incoming request webhook](https://zapier.com/automations/sales/sales-enablement/sales-content-management/create-tailored-sales-decks-from-incoming-request-webhook) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-tailored-sales-decks-from-incoming-request-webhook

The agent follows `SKILL.md`: it asks you for the template deck, the Zapier Tables table that holds your account records, and whether decks are shared with anyone who has the link, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent builds, asks and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-slides`, `storage`, `zapier-tables`)
- `triggers/`: what starts it
