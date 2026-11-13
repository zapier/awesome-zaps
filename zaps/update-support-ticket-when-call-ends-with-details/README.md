# Update support ticket when call ends with details

When a call ends, its support ticket gets the call status, times, recording link and a summary note, so coordinators can triage without looking anything up.

**Apps:** Webhooks by Zapier, Zapier Tables, HubSpot, Gmail

**Based on:** [Update support ticket when call ends with details](https://zapier.com/automations/customer-service-success/call-center-operations/post-call-processing/update-support-ticket-when-call-ends-with-details) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-support-ticket-when-call-ends-with-details

The agent follows `SKILL.md`: it asks you for the Zapier Tables table of call records and the address for no-ticket alerts, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `hubspot`)
- `triggers/`: what starts it
