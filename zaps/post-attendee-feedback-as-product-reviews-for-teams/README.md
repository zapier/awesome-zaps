# Post attendee feedback as product reviews for teams

Each attendee feedback form submission with a rating or review text is posted to your review platform, so good feedback becomes a publishable review without manual copying.

**Apps:** Typeform, Webhooks by Zapier

**Based on:** [Post attendee feedback as product reviews for teams](https://zapier.com/automations/product/product-feedback-management/user-feedback-collection/post-attendee-feedback-as-product-reviews-for-teams) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/post-attendee-feedback-as-product-reviews-for-teams

The agent follows `SKILL.md`: it asks you for your Typeform form, the form questions that hold each review field, your review platform's endpoint URL and the product identifier, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`typeform`)
- `triggers/`: what starts it
