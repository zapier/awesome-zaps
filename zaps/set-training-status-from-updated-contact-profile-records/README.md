# Set training status from updated contact profile records

When a contact's training status changes in HubSpot, a simple true/false flag on that contact is updated to match, so compliance can filter on it.

**Apps:** HubSpot

**Based on:** [Set training status from updated contact profile records](https://zapier.com/automations/human-resources-hr/hr-compliance/compliance-training-management/set-training-status-from-updated-contact-profile-records) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/set-training-status-from-updated-contact-profile-records

The agent follows `SKILL.md`: it asks you for your HubSpot training property and the checkbox property that receives the flag, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`hubspot`)
- `triggers/`: what starts it
