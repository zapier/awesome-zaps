# Create new e-store user and assign access roles

When a new user intake item appears on a monday.com board, the customer's store account is created, given the role chosen on the form, and the new user gets a welcome email with a temporary password.

**Apps:** monday.com, Webhooks by Zapier, Microsoft Outlook

**Based on:** [Create new e-store user and assign access roles](https://zapier.com/automations/it/identity-access-management/user-provisioning/create-new-e-store-user-and-assign-access-roles) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-new-e-store-user-and-assign-access-roles

The agent follows `SKILL.md`: it asks you for your intake board, the customer platform's API URL, role IDs and onboarding links, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`microsoft-outlook`, `monday`)
- `triggers/`: what starts it
