# Send exit feedback request to departing customer owner

When a membership cancellation comes in, the departing customer gets a short, personal email asking what could have been better, with a link to your feedback form.

**Apps:** Webhooks by Zapier, Microsoft Outlook

**Based on:** [Send exit feedback request to departing customer owner](https://zapier.com/automations/customer-service-success/customer-experience-management/customer-feedback-management/send-exit-feedback-request-to-departing-customer-owner) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-exit-feedback-request-to-departing-customer-owner

The agent follows `SKILL.md`: it asks you for your feedback survey link, the Outlook account that sends the email and whether to copy a retention inbox, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`microsoft-outlook`)
- `triggers/`: what starts it
