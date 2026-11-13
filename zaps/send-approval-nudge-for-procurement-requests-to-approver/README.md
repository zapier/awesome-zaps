# Send approval nudge for procurement requests to approver

When a procurement request reaches approval, the approver gets a Slack message with the key details and a link to the record, so requests stop sitting unseen.

**Apps:** Webhooks by Zapier, Slack

**Based on:** [Send approval nudge for procurement requests to approver](https://zapier.com/automations/business-owners/procurement-operations/procurement-workflow-management/send-approval-nudge-for-procurement-requests-to-approver) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-approval-nudge-for-procurement-requests-to-approver

The agent follows `SKILL.md`: it asks you for the URL of one request page in your procurement system, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`slack`)
- `triggers/`: what starts it
