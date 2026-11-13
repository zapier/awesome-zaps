# Post SSL renewal notices to your team channel

When a certificate renewal or failure email arrives, its sender, subject and a short preview are posted to your team's Slack channel, with a link back to the original email, so the ops or technical lead can triage it quickly.

**Apps:** Gmail, Slack

**Based on:** [Post SSL renewal notices to your team channel](https://zapier.com/automations/it/security-operations/ssl-certificate-management/post-ssl-renewal-notices-to-your-team-channel) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/post-ssl-renewal-notices-to-your-team-channel

The agent follows `SKILL.md`: it asks you which Gmail account receives the certificate emails and which Slack channel gets the notices, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `slack`)
- `triggers/`: what starts it
</content>
