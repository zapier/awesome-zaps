# Add SMS opt-ins from incoming replies to consent tracker

When someone texts an opt-in keyword to your number, they get a consent record in your Airtable tracker with their phone number, name and original reply, so you can prove consent later.

**Apps:** Webhooks by Zapier, Airtable

**Based on:** [Add SMS opt-ins from incoming replies to consent tracker](https://zapier.com/automations/legal/privacy-compliance/consent-management/add-sms-opt-ins-from-incoming-replies-to-consent-tracker) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/add-sms-opt-ins-from-incoming-replies-to-consent-tracker

The agent follows `SKILL.md`: it asks you for the Airtable base and table that hold consent records, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`airtable`)
- `triggers/`: what starts it
