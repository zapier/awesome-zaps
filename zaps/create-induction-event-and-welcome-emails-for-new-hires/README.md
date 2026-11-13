# Create induction event and welcome emails for new hires

When a new hire's start date is entered in your onboarding table, the new hire gets a welcome email, IT and license owners get a provisioning email, and an induction event goes on the HR calendar.

**Apps:** Zapier Tables, Gmail, Google Calendar

**Based on:** [Create induction event and welcome emails for new hires](https://zapier.com/automations/human-resources-hr/talent-pipeline-management/employee-onboarding/create-induction-event-and-welcome-emails-for-new-hires) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-induction-event-and-welcome-emails-for-new-hires

The agent follows `SKILL.md`: it asks you for the new-hire table, the HR calendar, and the HR coordinator, IT and license-owner addresses, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `google-calendar`, `zapier-tables`)
- `triggers/`: what starts it
