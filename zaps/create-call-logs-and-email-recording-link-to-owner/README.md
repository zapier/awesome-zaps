# Create call logs and email recording link to owner

Log each finished call to a Google Sheets call log, with its timing and recording link, and email the recording link to the owner.

**Apps:** Webhooks by Zapier, Google Sheets, Gmail

**Based on:** [Create call logs and email recording link to owner](https://zapier.com/automations/customer-service-success/call-center-operations/post-call-processing/create-call-logs-and-email-recording-link-to-owner) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-call-logs-and-email-recording-link-to-owner

The agent follows `SKILL.md`: it asks you for the call-log sheet and the owner's email address, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `google-sheets`)
- `triggers/`: what starts it
