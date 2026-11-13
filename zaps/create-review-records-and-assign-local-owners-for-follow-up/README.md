# Create review records and assign local owners for follow up

Each new Google Business Profile review is saved as a row in your review table, so your team can follow up on it from one place.

**Apps:** Google Business Profile, Zapier Tables

**Based on:** [Create review records and assign local owners for follow up](https://zapier.com/automations/marketing/review-reputation-management/review-collection/create-review-records-and-assign-local-owners-for-follow-up) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-review-records-and-assign-local-owners-for-follow-up

The agent follows `SKILL.md`: it asks you for the Google Business Profile location to watch and the Zapier Table that holds the reviews, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-business-profile`, `zapier-tables`)
- `triggers/`: what starts it
