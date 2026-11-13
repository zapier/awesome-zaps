# Send customer conversion to ad platform after update

When a HubSpot contact becomes a customer, their conversion is sent to Google Ads a day later, so your paid campaigns learn from real sales.

**Apps:** HubSpot, Google Ads

**Based on:** [Send customer conversion to ad platform after update](https://zapier.com/automations/marketing/advertising-ppc/google-ads-management/send-customer-conversion-to-ad-platform-after-update) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-customer-conversion-to-ad-platform-after-update

The agent follows `SKILL.md`: it asks you which Google Ads conversion action gets the conversions and which account sends them, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-ads`, `hubspot`)
- `triggers/`: what starts it
