# Send live chat inquiries to your bookings channel

When a visitor sends a live chat message, your bookings channel gets a short alert with who wrote, what they said and a link to the conversation, so coordinators can reply fast.

**Apps:** Webhooks by Zapier, Slack

**Based on:** [Send live chat inquiries to your bookings channel](https://zapier.com/automations/customer-service-success/conversational-support/live-chat-management/send-live-chat-inquiries-to-your-bookings-channel) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-live-chat-inquiries-to-your-bookings-channel

The agent follows `SKILL.md`: it asks you for your bookings channel and a few details about your chat tool, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`slack`)
- `triggers/`: what starts it
