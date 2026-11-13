# Post updated lost customer survey row to team channel

When a lost-customer survey row is completed in your tracking sheet, a summary lands in your team channel with a link back to the row, so stakeholders can triage and assign follow-up right away.

**Apps:** Google Sheets, Slack

**Based on:** [Post updated lost customer survey row to team channel](https://zapier.com/automations/customer-service-success/customer-experience-management/customer-feedback-management/post-updated-lost-customer-survey-row-to-team-channel) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/post-updated-lost-customer-survey-row-to-team-channel

The agent follows `SKILL.md`: it asks you for your tracker sheet and tab, the Slack channel to post into, and which columns hold each survey field, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-sheets`, `slack`)
- `triggers/`: what starts it
