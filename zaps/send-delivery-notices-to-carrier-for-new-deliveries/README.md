# Send delivery notices to carrier for new deliveries

When a delivery event comes in, the carrier gets an email with the pickup date, location, address, recipient, delivery window and weight, so dispatch doesn't have to send each one by hand.

**Apps:** Webhooks by Zapier, Gmail

**Based on:** [Send delivery notices to carrier for new deliveries](https://zapier.com/automations/business-owners/logistics-management/delivery-scheduling/send-delivery-notices-to-carrier-for-new-deliveries) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-delivery-notices-to-carrier-for-new-deliveries

The agent follows `SKILL.md`: it asks you for the carrier's inbox, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`gmail`)
- `triggers/`: what starts it
