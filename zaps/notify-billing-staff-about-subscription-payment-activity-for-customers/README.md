# Notify billing staff about subscription payment activity

Whenever a customer's subscription changes in Stripe, billing staff get an email with the customer, the new status and the latest invoice, so they can act the same day.

**Apps:** Stripe, Gmail

**Based on:** [Notify billing staff about subscription payment activity for customers](https://zapier.com/automations/sales/renewal-management/subscription-renewal-workflows/notify-billing-staff-about-subscription-payment-activity-for-customers) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/notify-billing-staff-about-subscription-payment-activity-for-customers

The agent follows `SKILL.md`: it asks you for the billing inbox that receives the alert, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `stripe`)
- `triggers/`: what starts it
