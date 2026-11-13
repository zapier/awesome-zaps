# Create employer profile and push to onboarding system

When a new Salesforce account is created, its onboarding profile is written to a Zapier Table, sent to your onboarding system, and the sync result is written back to both places.

**Apps:** Salesforce, Zapier Tables, Webhooks by Zapier

**Based on:** [Create employer profile and push to onboarding system](https://zapier.com/automations/human-resources-hr/talent-pipeline-management/employee-onboarding/create-employer-profile-and-push-to-onboarding-system) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-employer-profile-and-push-to-onboarding-system

The agent follows `SKILL.md`: it asks you for your onboarding table, onboarding API endpoint and token, and the Salesforce fields that receive its results, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`salesforce`, `zapier-tables`)
- `triggers/`: what starts it
