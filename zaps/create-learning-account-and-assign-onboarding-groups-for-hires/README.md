# Create learning account and assign onboarding groups for hires

When a new employee is added in BambooHR, they get a Go1 learning account and join the onboarding training groups for their division and location, so required courses are waiting on day one.

**Apps:** BambooHR, Go1

**Based on:** [Create learning account and assign onboarding groups for hires](https://zapier.com/automations/human-resources-hr/learning-development/training-assignment/create-learning-account-and-assign-onboarding-groups-for-hires) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-learning-account-and-assign-onboarding-groups-for-hires

The agent follows `SKILL.md`: it asks you which BambooHR locations count as local, which divisions get onboarding groups and which Go1 groups they join, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code; its `REPLACE_…` values are filled in for each person
- `config.ts`: its settings
- `connections/`: the accounts it uses (`bamboohr`, `go1`)
- `triggers/`: what starts it
