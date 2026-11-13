# Send templated meeting reply SMS to client texts

When a client texts back a reply code, they get the matching meeting reply by SMS straight away, so scheduling needs no manual follow-up.

**Apps:** Quo, Zapier Tables

**Based on:** [Send templated meeting reply SMS to client texts](https://zapier.com/automations/personal-productivity/communication-management/sms-automation/send-templated-meeting-reply-sms-to-client-texts) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-templated-meeting-reply-sms-to-client-texts

The agent follows `SKILL.md`: it asks you for the Quo numbers, the Zapier Table with your reply templates and the Quo number clients text, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`quo`, `zapier-tables`)
- `triggers/`: what starts it
