# Create release trigger from merged pull request commits

When a pull request is merged, its commit is passed to your sub-zap with the commit link, message, author and repository, so release steps start without anyone copying details.

**Apps:** GitHub, Webhooks by Zapier

**Based on:** [Create release trigger from merged pull request commits](https://zapier.com/automations/engineering/software-delivery/release-management/create-release-trigger-from-merged-pull-request-commits) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-release-trigger-from-merged-pull-request-commits

The agent follows `SKILL.md`: it asks you for the repository to watch and your sub-zap's webhook URL, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`github`)
- `triggers/`: what starts it
