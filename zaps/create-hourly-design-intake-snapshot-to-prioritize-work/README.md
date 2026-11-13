# Create hourly design intake snapshot to prioritize work

Every hour, the design requests still open in your intake sheet are sorted by priority, unassigned ones are flagged, and the list is emailed to the person who decides what to work on next.

**Apps:** Schedule by Zapier, Google Sheets, Gmail

**Based on:** [Create hourly design intake snapshot to prioritize work](https://zapier.com/automations/design/design-project-management/design-request-intake/create-hourly-design-intake-snapshot-to-prioritize-work) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-hourly-design-intake-snapshot-to-prioritize-work

The agent follows `SKILL.md`: it asks you for the intake spreadsheet and the email address that gets the digest, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `google-sheets`)
- `triggers/`: what starts it
