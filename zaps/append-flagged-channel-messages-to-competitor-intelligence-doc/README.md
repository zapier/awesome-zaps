# Append flagged channel messages to competitor intelligence doc

Capture Slack channel messages that mention competitors and append them to one central Google Doc, so the team can search them in one place. Duplicates are skipped.

**Apps:** Slack, Google Docs

**Based on:** [Append flagged channel messages to competitor intelligence doc](https://zapier.com/automations/executives/strategy-planning/competitive-intelligence/append-flagged-channel-messages-to-competitor-intelligence-doc) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/append-flagged-channel-messages-to-competitor-intelligence-doc

The agent follows `SKILL.md`: it asks you for the Slack channel to watch and your workspace URL, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-docs`, `slack`)
- `triggers/`: what starts it
