# Publish planned feature releases to the GTM team channel

When a feature release is marked planned or ready in your Notion tracker, the GTM team's Slack channel gets a short announcement with the release details and a link to the item.

**Apps:** Notion, Slack

**Based on:** [Publish planned feature releases to GTM team channel](https://zapier.com/automations/product/product-launch-management/feature-announcement/publish-planned-feature-releases-to-gtm-team-channel) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/publish-planned-feature-releases-to-gtm-team-channel

The agent follows `SKILL.md`: it asks you which Notion database is the release tracker and which Slack channel is the GTM team channel, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`notion`, `slack`)
- `triggers/`: what starts it
