# Assign on-call contact from next calendar event to roster

Shortly before an on-call shift starts, the calendar event is updated with the responder's contact, so coordinators see who is on call without opening a roster.

**Apps:** Google Calendar

**Based on:** [Assign on-call contact from next calendar event to roster](https://zapier.com/automations/engineering/engineering-operations/on-call-rotation-management/assign-on-call-contact-from-next-calendar-event-to-roster) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/assign-on-call-contact-from-next-calendar-event-to-roster

The agent follows `SKILL.md`: it asks you for the rotation calendar, the rotation names with their on-call contacts, and a default contact, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`google-calendar`)
- `triggers/`: what starts it
