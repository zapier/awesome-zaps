# Post model monitoring emails to data science channel

When a model monitoring alert email arrives, its subject and a short snippet are posted to your data science Slack channel with a link to the original, so the team sees it right away.

**Apps:** Gmail, Slack

**Based on:** [Post model monitoring emails to data science channel](https://zapier.com/automations/engineering/ml-ops-ai-operations/model-monitoring-alerting/post-model-monitoring-emails-to-data-science-channel) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/post-model-monitoring-emails-to-data-science-channel

The agent follows `SKILL.md`: it asks you for the Slack channel that gets the alert posts, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `slack`)
- `triggers/`: what starts it
