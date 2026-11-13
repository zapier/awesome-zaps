# Add training program link to new person records

When a new Pipedrive person has a training reference, the matching program link from your Zapier Table is copied onto their record.

**Apps:** Pipedrive, Zapier Tables

**Based on:** [Add training program link to new person records](https://zapier.com/automations/human-resources-hr/learning-development/training-assignment/add-training-program-link-to-new-person-records) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/add-training-program-link-to-new-person-records

The agent follows `SKILL.md`: it asks you for the Zapier Table that holds the programs and the two Pipedrive fields, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`pipedrive`, `zapier-tables`)
- `triggers/`: what starts it
