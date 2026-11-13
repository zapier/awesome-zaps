# Notify revenue team of subscriptions scheduled to cancel

When a Stripe subscription is set to cancel at the end of its billing period, the revenue team and account owner get an email straight away, so they can start retention outreach in time.

**Apps:** Stripe, Gmail

**Based on:** [Notify revenue team of subscriptions scheduled to cancel](https://zapier.com/automations/sales/renewal-management/subscription-renewal-workflows/notify-revenue-team-of-subscriptions-scheduled-to-cancel) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/notify-revenue-team-of-subscriptions-scheduled-to-cancel

The agent follows `SKILL.md`: it asks you for the Stripe account to watch and the revenue team and account owner email addresses, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `stripe`)
- `triggers/`: what starts it
