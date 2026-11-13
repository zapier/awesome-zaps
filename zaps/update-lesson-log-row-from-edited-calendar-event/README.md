# Update lesson log row from edited calendar event

When a lesson on your calendar is created or edited, its row in your lesson-log sheet is updated to match, or a new row is added if none has that event ID.

**Apps:** Google Calendar, Google Sheets

**Based on:** [Update lesson log row from edited calendar event](https://zapier.com/automations/business-owners/education-operations/attendance-tracking/update-lesson-log-row-from-edited-calendar-event) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-lesson-log-row-from-edited-calendar-event

The agent follows `SKILL.md`: it asks you for your lesson calendar and lesson-log sheet, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-calendar`, `google-sheets`)
- `triggers/`: what starts it
