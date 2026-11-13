# Create performance evaluation cards for upcoming staff reviews

Each weekday morning, supervisors get a Trello card with a checklist and evaluation form link for every employee whose review is coming up within three weeks.

**Apps:** Schedule by Zapier, Zapier Tables, Trello

**Based on:** [Create performance evaluation cards for upcoming staff reviews](https://zapier.com/automations/human-resources-hr/performance-management/performance-review-cycles/create-performance-evaluation-cards-for-upcoming-staff-reviews) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-performance-evaluation-cards-for-upcoming-staff-reviews

The agent follows `SKILL.md`: it asks you for the employees table, the Trello board and list, and the evaluation form's URL, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`trello`, `zapier-tables`)
- `triggers/`: what starts it
