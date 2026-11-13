# Generate meeting summary docs and action items for projects

When a meeting row is added or updated in a Zapier Table, this turns it into a dated Google Doc with decisions, action items, key quotes, follow-ups, and the companies mentioned.

**Apps:** Zapier Tables, AI by Zapier, Google Docs

**Based on:** [Generate meeting summary docs and action items for projects](https://zapier.com/automations/executives/meeting-management/action-item-tracking/generate-meeting-summary-docs-and-action-items-for-projects) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/generate-meeting-summary-docs-and-action-items-for-projects

The agent follows `SKILL.md`: it asks you for your meeting tracker table, the Drive folder for the docs and the Google account that owns them, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-docs`, `zapier-tables`)
- `triggers/`: what starts it
