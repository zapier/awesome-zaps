# Send new motor claim notification to claims team

When a new motor claim lands in your claims table, the claims team gets one email with the claimant's details, formatted dates, any expiry problems and the attachments.

**Apps:** Zapier Tables, Microsoft Outlook

**Based on:** [Send new motor claim notification to claims team](https://zapier.com/automations/business-owners/insurance-management/claims-management/send-new-motor-claim-notification-to-claims-team) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-new-motor-claim-notification-to-claims-team

The agent follows `SKILL.md`: it asks you for the claims table and the inbox that gets each notification, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`microsoft-outlook`, `zapier-tables`)
- `triggers/`: what starts it
