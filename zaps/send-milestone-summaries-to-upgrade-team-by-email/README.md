# Send milestone summaries to upgrade team by email

When a customer milestone event (30, 60, 90 or 180 days) comes up on a Google Calendar, the upgrade team gets a short email with the account's notes.

**Apps:** Google Calendar, Gmail

**Based on:** [Send milestone summaries to upgrade team by email](https://zapier.com/automations/customer-service-success/customer-success-operations/proactive-customer-outreach/send-milestone-summaries-to-upgrade-team-by-email) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-milestone-summaries-to-upgrade-team-by-email

The agent follows `SKILL.md`: it asks you which calendar holds the milestone events and who gets the summaries, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `google-calendar`)
- `triggers/`: what starts it
