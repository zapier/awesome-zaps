# Create internal intake records from partner form entries

Copy each new partner application from a Jotform Enterprise form into your internal intake form, so nobody rekeys it.

**Apps:** Jotform Enterprise

**Based on:** [Create internal intake records from partner form entries](https://zapier.com/automations/sales/partner-channel-sales/partner-onboarding/create-internal-intake-records-from-partner-form-entries) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-internal-intake-records-from-partner-form-entries

The agent follows `SKILL.md`: it asks you for your Jotform workspace, the partner and intake forms, and which partner answers map to which intake fields, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`jotform-enterprise`)
- `triggers/`: what starts it
