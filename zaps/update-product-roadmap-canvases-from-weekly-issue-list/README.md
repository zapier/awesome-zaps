# Update product roadmap canvases from weekly issue list

Every week, the roadmap items your team touched in Jira are matched to their roadmap canvas, so the canvas shows current status, priority, due date and progress without anyone copying them by hand.

**Apps:** Schedule by Zapier, Jira Software Cloud

**Based on:** [Update product roadmap canvases from weekly issue list](https://zapier.com/automations/product/product-roadmap-management/roadmap-updates/update-product-roadmap-canvases-from-weekly-issue-list) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-product-roadmap-canvases-from-weekly-issue-list

The agent follows `SKILL.md`: it asks you for the Jira label that marks roadmap items and which Jira projects map to which roadmap canvases, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code; the `REPLACE_…` values are filled in for each person
- `config.ts`: its settings
- `connections/`: the account it uses (`jira-software-cloud`)
- `triggers/`: what starts it
