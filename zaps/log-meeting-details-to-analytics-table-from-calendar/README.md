# Log meeting details to analytics table from calendar

Each new or updated Google Calendar event becomes one row in your analytics table, with start, end, length and attendees, so dashboards and follow-ups have consistent meeting data.

**Apps:** Google Calendar, Zapier Tables

**Based on:** [Log meeting details to analytics table from calendar](https://zapier.com/automations/data-analytics/data-automation/automated-data-collection/log-meeting-details-to-analytics-table-from-calendar) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/log-meeting-details-to-analytics-table-from-calendar

The agent follows `SKILL.md`: it asks you for the calendar to watch and the analytics table, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-calendar`, `zapier-tables`)
- `triggers/`: what starts it
