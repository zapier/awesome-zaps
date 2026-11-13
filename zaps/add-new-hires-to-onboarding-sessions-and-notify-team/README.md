# Add new hires to onboarding sessions and notify team

When a new Google Workspace account is created, your team gets a Slack heads-up, and a day later the hire is found in BambooHR and added to the onboarding sessions for their start date and location.

**Apps:** Google Workspace Admin, BambooHR, Google Calendar, Slack

**Based on:** [Add new hires to onboarding sessions and notify team](https://zapier.com/automations/human-resources-hr/talent-pipeline-management/employee-onboarding/add-new-hires-to-onboarding-sessions-and-notify-team) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/add-new-hires-to-onboarding-sessions-and-notify-team

The agent follows `SKILL.md`: it asks you for the onboarding Slack channel and the onboarding calendar, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`bamboohr`, `google-calendar`, `google-workspace-admin`, `slack`)
- `triggers/`: what starts it
