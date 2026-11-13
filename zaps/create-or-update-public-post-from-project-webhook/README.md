# Create or update public post from project webhook

When a project event arrives, its public release-notes post is created or refreshed, the tracking table is updated, and the team gets a short Discord note.

**Apps:** Webhooks by Zapier, Zapier Tables, Discord

**Based on:** [Create or update public post from project webhook](https://zapier.com/automations/product/digital-product-operations/release-notes-management/create-or-update-public-post-from-project-webhook) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-or-update-public-post-from-project-webhook

The agent follows `SKILL.md`: it asks you for your tracking table, CMS posts endpoint, CMS category and Discord channel, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`cms_api`, `discord`, `zapier-tables`)
- `triggers/`: what starts it
