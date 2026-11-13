# Send new email contents to intake endpoint for processing

When a new email arrives in your support inbox, its subject, plain-text body, sender and message ID are posted as JSON to your intake endpoint, so a ticketing or processing system can turn it into a ticket.

**Apps:** Gmail, Webhooks by Zapier

**Based on:** [Send new email contents to intake endpoint for processing](https://zapier.com/automations/customer-service-success/omnichannel-support/email-to-ticket-conversion/send-new-email-contents-to-intake-endpoint-for-processing) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-new-email-contents-to-intake-endpoint-for-processing

The agent follows `SKILL.md`: it asks you for the intake endpoint URL and which emails to forward, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`gmail`)
- `triggers/`: what starts it
