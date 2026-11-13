# Create monthly policy admin ticket for compliance reviews

On the 4th of each month, a Zendesk ticket is opened for the policy report review, assigned to your policy queue and tagged, so there is a tracked item and an audit trail.

**Apps:** Schedule by Zapier, Zendesk

**Based on:** [Create monthly policy admin ticket for compliance reviews](https://zapier.com/automations/legal/compliance-management/compliance-task-tracking/create-monthly-policy-admin-ticket-for-compliance-reviews) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-monthly-policy-admin-ticket-for-compliance-reviews

The agent follows `SKILL.md`: it asks you for the Zendesk group that is your policy support queue, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`zendesk`)
- `triggers/`: what starts it
