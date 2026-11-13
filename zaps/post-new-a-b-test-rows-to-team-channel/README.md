# Post new A/B test rows to team channel

When someone adds an A/B test to your tracking sheet, its variants, link, reporter and screenshot are posted to your team's Slack channel so everyone can review it right away.

**Apps:** Google Sheets, Slack

**Based on:** [Post new A/B test rows to team channel](https://zapier.com/automations/design/user-testing/a-b-test-management/post-new-a-b-test-rows-to-team-channel) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/post-new-a-b-test-rows-to-team-channel

The agent follows `SKILL.md`: it asks you which spreadsheet is the test log and which Slack channel gets the posts, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-sheets`, `slack`)
- `triggers/`: what starts it
