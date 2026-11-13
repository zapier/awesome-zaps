# Delete meeting recordings after 30-day retention

Cloud recordings are automatically deleted 30 days after they finish, so retention rules are enforced without anyone remembering to clean up.

**Apps:** Zoom

**Based on:** [Delete meeting recordings after 30 day retention for ops](https://zapier.com/automations/data-analytics/data-compliance-security/data-retention-management/delete-meeting-recordings-after-30-day-retention-for-ops) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/delete-meeting-recordings-after-30-day-retention-for-ops

The agent follows `SKILL.md`: it asks you which Zoom account holds the recordings and whether deletion is permanent or moves them to Zoom's trash, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`zoom`)
- `triggers/`: what starts it
