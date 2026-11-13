# Create CRM lead and open deal from booking

When someone books a call through Calendly, they are added to your Pipedrive as a contact and an open deal is created for your rep to follow up on.

**Apps:** Calendly, Pipedrive

**Based on:** [Create CRM lead and open deal from booking](https://zapier.com/automations/sales/crm-management/contact-management/create-crm-lead-and-open-deal-from-booking) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-crm-lead-and-open-deal-from-booking

The agent follows `SKILL.md`: it asks you for the Pipedrive stage and owner for new deals, and the Calendly event names to match, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`calendly`, `pipedrive`)
- `triggers/`: what starts it
