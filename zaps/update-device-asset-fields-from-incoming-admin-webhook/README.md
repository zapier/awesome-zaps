# Update device asset fields from incoming admin webhook

When an admin submits device details, the matching Notion record gets its asset number and model filled in automatically, so the asset list stays complete.

**Apps:** Webhooks by Zapier, Notion

**Based on:** [Update device asset fields from incoming admin webhook](https://zapier.com/automations/it/it-operations/it-asset-management/update-device-asset-fields-from-incoming-admin-webhook) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-device-asset-fields-from-incoming-admin-webhook

The agent follows `SKILL.md`: it asks you what your admin submission sends and which Notion workspace holds the asset records, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings
- `connections/`: the account it uses (`notion`)
- `triggers/`: what starts it
