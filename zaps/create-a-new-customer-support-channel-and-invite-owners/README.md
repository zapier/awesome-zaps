# Create a new customer support channel and invite owners

When another automation hands it a new customer, a Slack channel is created for them, the account owner and your support team are invited, and the channel ID is passed back.

**Apps:** Sub-Zap by Zapier, Slack

**Based on:** [Create a new customer support channel and invite owners](https://zapier.com/automations/business-owners/team-communication/slack-integration/create-a-new-customer-support-channel-and-invite-owners) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-a-new-customer-support-channel-and-invite-owners

The agent follows `SKILL.md`: it asks you for your Slack workspace, the support members to invite and how owners are identified, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent builds, asks and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings, such as the channel name prefix
- `connections/`: the accounts it uses (`slack`, `sub-zap-by-zapier`)
- `triggers/`: what starts it
