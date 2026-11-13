# Update churn record from cancellation flow

When a customer finishes a cancellation flow, their row in your churn sheet is updated with the answers and plan details, so success teams see why they left.

**Apps:** Webhooks by Zapier, Google Sheets

**Based on:** [Update churn record from cancellation flow for success ops](https://zapier.com/automations/customer-service-success/customer-success-operations/customer-retention-management/update-churn-record-from-cancellation-flow-for-success-ops) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-churn-record-from-cancellation-flow-for-success-ops

The agent follows `SKILL.md`: it asks you for your churn sheet, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`google-sheets`)
- `triggers/`: what starts it
