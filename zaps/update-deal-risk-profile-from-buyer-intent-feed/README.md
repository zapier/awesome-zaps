# Update deal risk profile from buyer intent feed

When a buyer-intent signal comes in, the matching Close lead's deal risk record is updated with the signals and notes, so sales sees the risk context right away.

**Apps:** Webhooks by Zapier, Close

**Based on:** [Update deal risk profile from buyer intent feed](https://zapier.com/automations/sales/sales-intelligence/buyer-intent-tracking/update-deal-risk-profile-from-buyer-intent-feed) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-deal-risk-profile-from-buyer-intent-feed

The agent follows `SKILL.md`: it asks you which Close custom object holds your deal risk records, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`close`)
- `triggers/`: what starts it
