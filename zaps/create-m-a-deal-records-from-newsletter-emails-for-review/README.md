# Create M&A deal records from newsletter emails

When a deal newsletter arrives, each M&A deal it mentions becomes a row in your deal table, and the team gets a short Slack summary to review.

**Apps:** Microsoft Outlook, AI by Zapier, Zapier Tables, Slack

**Based on:** [Create M&A deal records from newsletter emails for review](https://zapier.com/automations/executives/corporate-development/due-diligence-management/create-m-a-deal-records-from-newsletter-emails-for-review) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-m-a-deal-records-from-newsletter-emails-for-review

The agent follows `SKILL.md`: it asks you for the newsletter folder, the deal table and the Slack channel for the summary, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`microsoft-outlook`, `slack`, `zapier-tables`)
- `triggers/`: what starts it
