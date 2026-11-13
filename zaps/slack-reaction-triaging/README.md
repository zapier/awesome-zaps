# Slack reaction to triage channel

React to a Slack message with :ticket: and it's posted to your triage channel with a link back to it.

**Apps:** Slack

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/slack-reaction-triaging

The agent follows `SKILL.md`: it asks you which channel to watch and which channel gets the triage posts, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`slack`)
- `triggers/`: what starts it
