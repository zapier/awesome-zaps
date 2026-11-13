# Send SMS for new online quote to requester

When someone requests a quote online, they get a text right away asking for their location and service, and their details are saved as a contact in Quo.

**Apps:** Webhooks by Zapier, Quo

**Based on:** [Send SMS for new online quote to requester](https://zapier.com/automations/marketing/sms-marketing/transactional-sms/send-sms-for-new-online-quote-to-requester) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-sms-for-new-online-quote-to-requester

The agent follows `SKILL.md`: it asks you which Quo number the texts come from, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`quo`)
- `triggers/`: what starts it
