# Create company calendar events from personal calendar updates

When you create or change an event on your personal calendar, the matching event on the company calendar is created or updated to match, so the team always sees the current roster.

**Apps:** Google Calendar

**Based on:** [Create company calendar events from personal calendar updates](https://zapier.com/automations/business-owners/scheduling-coordination/calendar-management/create-company-calendar-events-from-personal-calendar-updates) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-company-calendar-events-from-personal-calendar-updates

The agent follows `SKILL.md`: it asks you for your personal calendar and the company calendar that receives the copies, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`google-calendar`)
- `triggers/`: what starts it
