# Create weekly board update and share preparation documents

Every week, a fresh dated board-update document is made from your template, shared for editing, and posted to your team's monday.com item with a Friday deadline.

**Apps:** Schedule by Zapier, OneDrive, monday.com

**Based on:** [Create weekly board update and share preparation documents](https://zapier.com/automations/executives/reporting-management/cross-functional-report-aggregation/create-weekly-board-update-and-share-preparation-documents) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-weekly-board-update-and-share-preparation-documents

The agent follows `SKILL.md`: it asks you for your OneDrive folder, your template file and the monday.com item that gets the update, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`monday`, `onedrive`)
- `triggers/`: what starts it
