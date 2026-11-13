# Send meeting notes email to advisor operations team

When a call ends, advisors get an email with the call title, who was on it, the topics discussed and the meeting link, with ops coordinators copied, so follow-up can happen the same day.

**Apps:** Webhooks by Zapier, Microsoft Outlook

**Based on:** [Send meeting notes email to advisor operations team](https://zapier.com/automations/executives/meeting-management/meeting-notes-distribution/send-meeting-notes-email-to-advisor-operations-team) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-meeting-notes-email-to-advisor-operations-team

The agent follows `SKILL.md`: it asks you for the advisors and ops coordinators who get the notes, the team mailbox for replies and the Outlook account that sends them, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`microsoft-outlook`)
- `triggers/`: what starts it
