# Create backlog items from product wish form submissions

Each new product wish form submission is sent to your intake endpoint as a clean backlog item, with reporter, request and interview consent in one payload.

**Apps:** Google Forms, Webhooks by Zapier

**Based on:** [Create backlog items from product wish form submissions](https://zapier.com/automations/product/product-feedback-management/feature-request-tracking/create-backlog-items-from-product-wish-form-submissions) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-backlog-items-from-product-wish-form-submissions

The agent follows `SKILL.md`: it asks you for the wish form, your intake endpoint URL and the product label, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`google-forms`)
- `triggers/`: what starts it
