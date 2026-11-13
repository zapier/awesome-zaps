# Send vibration alert to on-call channel with formatted value

When a device reports a vibration reading above your limit, the on-call chat gets a formatted alert with the device, the reading and the time, so technicians can triage quickly.

**Apps:** Webhooks by Zapier, Telegram

**Based on:** [Send vibration alert to on call channel with formatted value](https://zapier.com/automations/it/io-t-connected-operations/device-alert-management/send-vibration-alert-to-on-call-channel-with-formatted-value) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-vibration-alert-to-on-call-channel-with-formatted-value

The agent follows `SKILL.md`: it asks you which Telegram chat is on call and what threshold to use, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`telegram`)
- `triggers/`: what starts it
