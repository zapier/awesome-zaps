# Create KYC packet and post notification to channel

When a fund's document request comes in, a KYC packet is created from the right template in your compliance folder and the reviewers get a Slack message with the link.

**Apps:** Webhooks by Zapier, Google Docs, Slack

**Based on:** [Create KYC packet and post notification to channel](https://zapier.com/automations/legal/regulatory-compliance/aml-kyc-compliance/create-kyc-packet-and-post-notification-to-channel) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-kyc-packet-and-post-notification-to-channel

The agent follows `SKILL.md`: it asks you for the compliance folder, the reviewer channel and the LLC and LP template documents, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent follows to build, ask and test
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-docs`, `slack`)
- `triggers/`: what starts it
