# Populate QA backlog items with randomized test content

When a QA backlog item in Notion gets or changes its category, a random matching test case from your spreadsheet is written into it, so testers start with a seeded case.

**Apps:** Notion, Google Sheets

**Based on:** [Populate QA backlog items with randomized test content](https://zapier.com/automations/engineering/quality-assurance/test-data-management/populate-qa-backlog-items-with-randomized-test-content) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/populate-qa-backlog-items-with-randomized-test-content

The agent follows `SKILL.md`: it asks you for your QA backlog database, the content sheet and its columns, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`notion`, `google-sheets`)
- `triggers/`: what starts it
