# Post AI triage suggestion into incident management channel

When a new message lands in an incident channel, AI by Zapier suggests the owning team, a confidence level and a one-line reason, and posts that as a threaded reply.

**Apps:** AI by Zapier, Microsoft Teams

**Based on:** [Post AI triage suggestion into incident management channel](https://zapier.com/automations/it/incident-response/incident-triage/post-ai-triage-suggestion-into-incident-management-channel) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/post-ai-triage-suggestion-into-incident-management-channel

The agent follows `SKILL.md`: it asks you for the incident channel's Teams team and channel, and which capabilities each team owns, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent builds, asks and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`microsoft-teams`)
- `triggers/`: what starts it
