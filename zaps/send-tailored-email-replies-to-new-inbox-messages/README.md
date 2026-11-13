# Send tailored email replies to new inbox messages

When a new email lands in your Outlook inbox, the sender gets a quick, tailored reply with your company signature, so they know they were heard.

**Apps:** Microsoft Outlook, AI by Zapier

**Based on:** [Send tailored email replies to new inbox messages](https://zapier.com/automations/customer-service-success/self-service-support/automated-response-management/send-tailored-email-replies-to-new-inbox-messages) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-tailored-email-replies-to-new-inbox-messages

The agent follows `SKILL.md`: it asks you for your company signature and which inbox to watch, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`microsoft-outlook`)
- `triggers/`: what starts it
