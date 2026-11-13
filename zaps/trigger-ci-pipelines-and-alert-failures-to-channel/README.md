# Trigger CI pipelines and alert failures to channel

When code is pushed to your main branch, a CI pipeline starts, and if it fails, the team channel gets a message with a link.

**Apps:** Webhooks by Zapier, Slack

**Based on:** [Trigger CI pipelines and alert failures to channel](https://zapier.com/automations/engineering/dev-ops/ci-cd-pipeline-management/trigger-ci-pipelines-and-alert-failures-to-channel) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/trigger-ci-pipelines-and-alert-failures-to-channel

The agent follows `SKILL.md`: it asks you for your CI system's start and status endpoints and the alert channel, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`slack`)
- `triggers/`: what starts it
