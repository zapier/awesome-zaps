# Update deal opt-in status from incoming webhook payloads

When a consent signal arrives on a webhook, this sets the matching Pipedrive deal's consent field to opt-in or opt-out, so sales sees current consent on the deal.

**Apps:** Webhooks by Zapier, Pipedrive

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-deal-opt-in-status-from-incoming-webhook-payloads

The agent follows `SKILL.md`: it asks you which Pipedrive field stores consent and whether your payload keys match the defaults, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`pipedrive`)
- `triggers/`: what starts it (a Webhooks by Zapier catch hook)
