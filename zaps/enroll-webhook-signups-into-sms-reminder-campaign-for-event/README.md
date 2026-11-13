# Enroll webhook signups into SMS reminder campaign for event

When someone signs up for your event through a form, they're saved as a lead in LeadConnector and enrolled in your SMS reminder campaign, so they get reminders without anyone adding them by hand.

**Apps:** Webhooks by Zapier, LeadConnector

**Based on:** [Enroll webhook signups into SMS reminder campaign for event](https://zapier.com/automations/marketing/sms-marketing/sms-campaign-management/enroll-webhook-signups-into-sms-reminder-campaign-for-event) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/enroll-webhook-signups-into-sms-reminder-campaign-for-event

The agent follows `SKILL.md`: it asks you for the LeadConnector campaign that sends the SMS reminders, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`leadconnector`)
- `triggers/`: what starts it
