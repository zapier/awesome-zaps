# Update release branch record on completed deployment status

When a deployment finishes, the release branch record in Salesforce is updated to show it reached production, whether it was a hotfix, and when it was last deployed to UAT.

**Apps:** Salesforce

**Based on:** [Update release branch record on completed deployment status](https://zapier.com/automations/engineering/software-delivery/release-management/update-release-branch-record-on-completed-deployment-status) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-release-branch-record-on-completed-deployment-status

The agent follows `SKILL.md`: it asks you for your Salesforce object and field names, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`salesforce`)
- `triggers/`: what starts it
