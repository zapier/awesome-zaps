# Unpaid invoice nudge

Three days after an invoice is due, the customer gets a friendly reminder in your voice. Still unpaid on day 7, you get a text.

**Apps:** QuickBooks Online, Webhooks by Zapier, AI by Zapier, Gmail, SMS by Zapier

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/unpaid-invoice-nudge

The agent follows `SKILL.md`: it asks you for your billing tool, your reminder voice and sender name, and which Gmail account sends the reminders, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings, including the optional status-check URL
- `connections/`: the accounts it uses (`gmail`, `quickbooks`, `sms`)
