# Add new member to onboarding meeting attendees instantly

When a new member's details arrive, they're added to your onboarding meeting in Outlook, so they get the invite without anyone adding them by hand.

**Apps:** Webhooks by Zapier, Microsoft Outlook

**Based on:** [Add new member to onboarding meeting attendees instantly](https://zapier.com/automations/business-owners/scheduling-coordination/appointment-scheduling/add-new-member-to-onboarding-meeting-attendees-instantly) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/add-new-member-to-onboarding-meeting-attendees-instantly

The agent follows `SKILL.md`: it asks you for the onboarding meeting's title, its date and its Outlook calendar, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`microsoft-outlook`)
- `triggers/`: what starts it
