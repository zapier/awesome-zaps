# Create consolidated OKR metrics list for program teams

Gathers every OKR metric record from an Airtable table, removes empty and duplicate IDs, and returns one comma-separated list for program-team reporting.

**Apps:** Airtable

**Based on:** [Create consolidated OKR metrics list for program teams](https://zapier.com/automations/product/product-operations/product-okr-tracking/create-consolidated-okr-metrics-list-for-program-teams) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-consolidated-okr-metrics-list-for-program-teams

The agent follows `SKILL.md`: it asks you which Airtable base and table hold the OKR metrics, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`airtable`)
