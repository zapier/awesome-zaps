# Update environment usage and log from deploy reaction

When someone reacts with :rocket: to a deploy message in Slack, the environment named in the message is marked in use in your registry sheet, the usage is logged with a timestamp, and a confirmation is posted in the message's thread.

**Apps:** Slack, Google Sheets

**Based on:** [Update environment usage and log from deploy reaction](https://zapier.com/automations/engineering/dev-ops/environment-management/update-environment-usage-and-log-from-deploy-reaction) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-environment-usage-and-log-from-deploy-reaction

The agent follows `SKILL.md`: it asks you for the deploy channel, the environment registry sheet and its usage-log tab, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`slack`, `google-sheets`)
- `triggers/`: what starts it
