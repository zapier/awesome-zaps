# Send release calendar alert to product marketing manager

When a release goes on the calendar, the owner gets a Slack message with the title, time and link so launch comms can start right away.

**Apps:** Google Calendar, Slack

**Based on:** [Send release calendar alert to product marketing manager](https://zapier.com/automations/product/product-launch-management/launch-coordination/send-release-calendar-alert-to-product-marketing-manager) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-release-calendar-alert-to-product-marketing-manager

The agent follows `SKILL.md`: it asks you which Google Calendar is the release calendar and who gets the alert when no Slack user matches the organizer, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-calendar`, `slack`)
- `triggers/`: what starts it
