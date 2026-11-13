# Set next follow-up date for contact items

When you update a contact's date in monday.com, the next follow-up date is set for you, one day later and never on a weekend.

**Apps:** monday.com

**Based on:** [Set next follow-up date for contact items](https://zapier.com/automations/personal-productivity/personal-crm/contact-follow-up-reminders/set-next-follow-up-date-for-contact-items) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/set-next-follow-up-date-for-contact-items

The agent follows `SKILL.md`: it asks you for your contacts board and its last-contact and next-follow-up date columns, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`monday`)
- `triggers/`: what starts it
