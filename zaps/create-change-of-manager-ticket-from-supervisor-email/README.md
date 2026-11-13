# Create change of manager ticket from supervisor email

When a supervisor emails your Outlook HR folder about a change of manager, an HR service request ticket naming the employee and new manager opens in Freshservice, so HR coordinators can process it right away.

**Apps:** Microsoft Outlook, AI by Zapier, Freshservice

**Based on:** [Create change of manager ticket from supervisor email](https://zapier.com/automations/human-resources-hr/hr-operations/hr-case-management/create-change-of-manager-ticket-from-supervisor-email) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-change-of-manager-ticket-from-supervisor-email

The agent follows `SKILL.md`: it asks you which Outlook folder gets the supervisor emails, which address tickets are filed under and which Freshservice department is HR, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`ai`, `freshservice`, `microsoft-outlook`)
- `triggers/`: what starts it
