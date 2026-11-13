# Send infrastructure status updates to contacts in affected list

When a contact is added to your affected-contacts list, they get a short infrastructure status email after a one-minute wait, so people hear from you before they open a ticket.

**Apps:** HubSpot, Gmail

**Based on:** [Send infrastructure status updates to contacts in affected list](https://zapier.com/automations/executives/crisis-incident-management/crisis-communication-distribution/send-infrastructure-status-updates-to-contacts-in-affected-list) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-infrastructure-status-updates-to-contacts-in-affected-list

The agent follows `SKILL.md`: it asks you for the HubSpot list of affected contacts and the status email wording, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings, such as the email subject
- `connections/`: the accounts it uses (`gmail`, `hubspot`)
- `triggers/`: what starts it; the `REPLACE_…` list ID is filled in for each person
