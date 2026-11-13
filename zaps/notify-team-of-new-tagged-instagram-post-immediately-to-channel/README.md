# Notify team of new tagged Instagram post immediately to channel

When someone tags your Instagram account, your team gets a Slack message with who tagged you, the caption, a link to the post and a preview, so coordinators can act on it right away.

**Apps:** Instagram for Business, Slack

**Based on:** [Notify team of new tagged Instagram post immediately to channel](https://zapier.com/automations/marketing/social-media-marketing/social-media-monitoring/notify-team-of-new-tagged-instagram-post-immediately-to-channel) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/notify-team-of-new-tagged-instagram-post-immediately-to-channel

The agent follows `SKILL.md`: it asks you for the Instagram business account to watch and the Slack channel for alerts, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`instagram-for-business`, `slack`)
- `triggers/`: what starts it
