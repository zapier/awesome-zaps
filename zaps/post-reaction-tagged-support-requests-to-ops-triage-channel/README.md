# Post reaction-tagged support requests to ops triage channel

When a teammate marks a Slack message with a support reaction, the message, its author and a link to it are posted to your triage channel so coordinators can act on it right away.

**Apps:** Slack

**Based on:** [Post reaction-tagged support requests to ops triage channel](https://zapier.com/automations/customer-service-success/customer-support-operations/ticket-routing/post-reaction-tagged-support-requests-to-ops-triage-channel) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/post-reaction-tagged-support-requests-to-ops-triage-channel

The agent follows `SKILL.md`: it asks you for the Slack channels to watch and to post to, the support reaction and the bot's name and icon, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`slack`)
- `triggers/`: what starts it
