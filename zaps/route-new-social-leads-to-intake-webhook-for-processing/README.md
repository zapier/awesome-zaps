# Route new social leads to intake webhook for processing

Each new Facebook lead form submission is posted as clean JSON to your intake system, so leads are processed the moment they arrive.

**Apps:** Facebook Lead Ads, Webhooks by Zapier

**Based on:** [Route new social leads to intake webhook for processing](https://zapier.com/automations/marketing/lead-management/lead-routing/route-new-social-leads-to-intake-webhook-for-processing) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/route-new-social-leads-to-intake-webhook-for-processing

The agent follows `SKILL.md`: it asks you for your intake endpoint URL and which Facebook Page and lead form to use, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`facebook-lead-ads`)
- `triggers/`: what starts it
