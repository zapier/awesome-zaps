# SMS lead alert

Texts you every new lead the moment it comes in: their name, number, what they need, and a reply you can send back.

**Apps:** Webhooks by Zapier, AI by Zapier, SMS by Zapier (optional: Facebook Lead Ads)

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/sms-lead-alert

The agent follows `SKILL.md`: it asks you for your SMS by Zapier connection and where your leads come from, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `connections/`: the account it uses (`sms`)
- `triggers/`: what starts it
