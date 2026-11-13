# Post one-time codes from email to an API endpoint

When a one-time code arrives by email, it is pulled out and sent straight to your verification endpoint, so provisioning finishes without anyone copying codes by hand.

**Apps:** Gmail, Webhooks by Zapier

**Based on:** [Post one-time codes from email to API endpoint](https://zapier.com/automations/data-analytics/data-integration/api-integration/post-one-time-codes-from-email-to-api-endpoint) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/post-one-time-codes-from-email-to-api-endpoint

The agent follows `SKILL.md`: it asks you for your endpoint URL, the vendor's sender address and the Gmail search that finds their code emails, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`gmail`)
- `triggers/`: what starts it
