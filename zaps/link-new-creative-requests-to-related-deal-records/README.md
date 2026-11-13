# Link new creative requests to related deal records

When a new creative request is created on your monday.com requests board, its matching deal is found in your deal tracker and linked to it, so the request owner sees the opportunity context straight away.

**Apps:** monday.com

**Based on:** [Link new creative requests to related deal records](https://zapier.com/automations/marketing/marketing-creative/design-request-management/link-new-creative-requests-to-related-deal-records) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/link-new-creative-requests-to-related-deal-records

The agent follows `SKILL.md`: it asks you which monday.com boards hold creative requests and deals, and which column links them, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`monday`)
- `triggers/`: what starts it
