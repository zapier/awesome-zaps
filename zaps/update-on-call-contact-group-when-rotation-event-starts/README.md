# Update on-call contact group when rotation event starts

When an on-call rotation event starts on your calendar, its rotation name is cleaned up and handed to your routing workflow with the handoff time and default contacts, so the on-call contact group follows the active rotation.

**Apps:** Google Calendar, Webhooks by Zapier

**Based on:** [Update on-call contact group when rotation event starts](https://zapier.com/automations/engineering/engineering-operations/on-call-rotation-management/update-on-call-contact-group-when-rotation-event-starts) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-on-call-contact-group-when-rotation-event-starts

The agent follows `SKILL.md`: it asks you which calendar holds the rotation events, for the routing workflow's webhook URL and for the default contacts, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`google-calendar`)
- `triggers/`: what starts it
