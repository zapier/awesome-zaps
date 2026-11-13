# Create daily crawl health check ticket for monitoring

Every morning a new Zendesk ticket is opened with a crawl health checklist and the run time, so monitoring staff start the day with the same triage steps.

**Apps:** Schedule by Zapier, Zendesk

**Based on:** [Create daily crawl health check ticket for monitoring](https://zapier.com/automations/it/it-service-management/it-ticketing/create-daily-crawl-health-check-ticket-for-monitoring) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-daily-crawl-health-check-ticket-for-monitoring

The agent follows `SKILL.md`: it asks you for the Zendesk monitoring group, the requester service account and the ticket defaults, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`zendesk`)
- `triggers/`: what starts it
