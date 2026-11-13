# Create structured meeting records in your tracking sheet

When a Google Calendar event is created or updated, a clean row with its title, organizer, start time and attendees goes into your tracking sheet.

**Apps:** Google Calendar, Google Sheets

**Based on:** [Create structured meeting records in your tracking sheet](https://zapier.com/automations/personal-productivity/spreadsheet-automation/google-sheets-automation/create-structured-meeting-records-in-your-tracking-sheet) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-structured-meeting-records-in-your-tracking-sheet

The agent follows `SKILL.md`: it asks you which calendar to watch and which sheet and tab hold the tracker, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-calendar`, `google-sheets`)
- `triggers/`: what starts it
