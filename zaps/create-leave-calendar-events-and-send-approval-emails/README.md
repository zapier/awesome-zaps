# Create leave calendar events and send approval emails

When an approver confirms a leave request, the leave goes on the team calendar, the requester gets an approval email, and their allowance is updated in the leave tracker.

**Apps:** Zapier Tables, Google Calendar, Gmail

**Based on:** [Create leave calendar events and send approval emails](https://zapier.com/automations/human-resources-hr/hr-operations/time-off-requests/create-leave-calendar-events-and-send-approval-emails) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-leave-calendar-events-and-send-approval-emails

The agent follows `SKILL.md`: it asks you for your leave requests table, leave tracker table and calendar, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `google-calendar`, `zapier-tables`)
- `triggers/`: what starts it
