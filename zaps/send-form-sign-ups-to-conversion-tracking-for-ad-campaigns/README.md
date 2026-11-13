# Send form sign-ups to conversion tracking for ad campaigns

Each new HubSpot form sign-up is sent to LinkedIn as a conversion, so your ad campaigns can see which clicks turned into sign-ups.

**Apps:** HubSpot, LinkedIn Conversions

**Based on:** [Send form sign-ups to conversion tracking for ad campaigns](https://zapier.com/automations/marketing/marketing-analytics/marketing-attribution/send-form-sign-ups-to-conversion-tracking-for-ad-campaigns) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-form-sign-ups-to-conversion-tracking-for-ad-campaigns

The agent follows `SKILL.md`: it asks you for the HubSpot form, the LinkedIn ad account and the conversion the sign-ups go to, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`hubspot`, `linkedin-conversions`)
- `triggers/`: what starts it
