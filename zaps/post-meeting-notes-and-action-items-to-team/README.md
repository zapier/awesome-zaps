# Post meeting notes and action items to team

When new meeting notes appear in your project folder, the action items are pulled out, logged in a meeting table and posted to your team channel.

**Apps:** Google Drive, Webhooks by Zapier, Zapier Tables, Slack

**Based on:** [Post meeting notes and action items to team](https://zapier.com/automations/executives/meeting-management/meeting-notes-distribution/post-meeting-notes-and-action-items-to-team) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/post-meeting-notes-and-action-items-to-team

The agent follows `SKILL.md`: it asks you for your meeting notes folder, team Slack channel and meetings table, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-drive`, `slack`, `zapier-tables`)
- `triggers/`: what starts it
