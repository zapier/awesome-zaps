# Update active rotation event to current on-call contact

When a rotation event on your on-call calendar is active right now, its contact is posted to your routing channel so the current on-call is applied immediately.

**Apps:** Google Calendar, Slack

**Based on:** [Update active rotation event to current on call contact](https://zapier.com/automations/engineering/engineering-operations/on-call-rotation-management/update-active-rotation-event-to-current-on-call-contact) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-active-rotation-event-to-current-on-call-contact

The agent follows `SKILL.md`: it asks you for the rotation calendar, the routing channel and the default members, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-calendar`, `slack`)
- `triggers/`: what starts it
