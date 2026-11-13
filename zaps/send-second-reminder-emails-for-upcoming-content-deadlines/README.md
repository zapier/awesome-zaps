# Send second reminder emails for upcoming content deadlines

One week before a scheduled content event, the contributor named in it gets a second reminder email with the date, unless they have already submitted.

**Apps:** Google Calendar, Gmail

**Based on:** [Send second reminder emails for upcoming content deadlines](https://zapier.com/automations/personal-productivity/email-management/email-follow-up-reminders/send-second-reminder-emails-for-upcoming-content-deadlines) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-second-reminder-emails-for-upcoming-content-deadlines

The agent follows `SKILL.md`: it asks you for the content calendar, the Gmail account that sends the reminders, your company's email domain, the blind-copy address and the submission marker, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `google-calendar`)
- `triggers/`: what starts it
