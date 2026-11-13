# Google review reply draft

Every new review gets a reply drafted in your voice and emailed to you to approve. 1 and 2 stars text you right away. 5 stars land in a testimonials sheet.

**Apps:** Google Business Profile, Webhooks by Zapier, AI by Zapier, SMS by Zapier, Gmail, Google Sheets

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/google-review-reply-draft

The agent follows `SKILL.md`: it asks you which email gets the drafts and which sheet holds 5-star reviews, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `google-sheets`, `sms`)
