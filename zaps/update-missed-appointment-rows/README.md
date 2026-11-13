# Update missed appointment rows

When an absence notice comes in, the attendee's row in your tracking sheet is marked as a no-show, timestamped and noted, so coordinators see it right away.

**Apps:** Webhooks by Zapier, Google Sheets

**Based on:** [Update missed appointment rows in your tracking sheet](https://zapier.com/automations/business-owners/education-operations/attendance-tracking/update-missed-appointment-rows-in-your-tracking-sheet) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-missed-appointment-rows

The agent follows `SKILL.md`: it asks you for your tracking sheet and its columns, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`google-sheets`)
- `triggers/`: what starts it
