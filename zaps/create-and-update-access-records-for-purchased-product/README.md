# Create and update access records for purchased product

When a customer pays for a product, their access record is created or updated in your user system so onboarding can start right away.

**Apps:** Shopify, Webhooks by Zapier

**Based on:** [Create and update access records for purchased product](https://zapier.com/automations/it/identity-access-management/user-provisioning/create-and-update-access-records-for-purchased-product) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-and-update-access-records-for-purchased-product

The agent follows `SKILL.md`: it asks you for the Shopify product that grants access and your user management API's endpoint, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`shopify`)
- `triggers/`: what starts it
