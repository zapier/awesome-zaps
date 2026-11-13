# NexHello business card to Notion

Scan a business card with NexHello and the contact lands in your Notion contacts database. Scan the same person again and the row is updated, never duplicated.

**Apps:** Webhooks by Zapier, Notion

**Based on:** [NexHello's guide to sending business cards to Notion with Zapier](https://www.nexhello.com/integrations/business-card-to-notion-with-zapier/).

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/nexhello-business-card-to-notion

The agent follows `SKILL.md`: it asks you for the Notion database that holds your contacts, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`notion`)
- `triggers/`: what starts it (a Webhooks by Zapier catch hook)
