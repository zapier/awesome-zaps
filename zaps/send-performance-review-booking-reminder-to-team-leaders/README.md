# Send performance review booking reminder to team leaders

Twice a year, every manager on your list gets an email reminding them to book their team's performance reviews before the appraisal period.

**Apps:** Schedule by Zapier, Gmail

**Based on:** [Send performance review booking reminder to team leaders](https://zapier.com/automations/human-resources-hr/performance-management/performance-review-cycles/send-performance-review-booking-reminder-to-team-leaders) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-performance-review-booking-reminder-to-team-leaders

The agent follows `SKILL.md`: it asks you for the managers' email addresses, the first reminder date and the Gmail account that sends it, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`gmail`)
- `triggers/`: what starts it
