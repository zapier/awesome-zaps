# Add AI evaluation note to candidate profile

When someone applies to your job in Greenhouse, AI reads their resume and answers, adds a screening note to their Greenhouse profile for a recruiter to review, and logs the application in your hiring tracker sheet.

**Apps:** Greenhouse, Files by Zapier, AI by Zapier, Google Sheets

**Based on:** [Add AI evaluation note to candidate profile quickly](https://zapier.com/automations/human-resources-hr/recruiting/candidate-screening/add-ai-evaluation-note-to-candidate-profile-quickly) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/add-ai-evaluation-note-to-candidate-profile

The agent follows `SKILL.md`: it asks you for your job, note author and tracker sheet, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`greenhouse`, `google-sheets`)
- `triggers/`: what starts it
