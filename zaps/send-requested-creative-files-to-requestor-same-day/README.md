# Send requested creative files to requestor same day

When a design request is marked Completed in your tracker sheet, the requestor gets an email with the finished files, and the design owner is copied.

**Apps:** Google Sheets, Gmail

**Based on:** [Send requested creative files to requestor same day](https://zapier.com/automations/design/creative-operations/design-handoff-management/send-requested-creative-files-to-requestor-same-day) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-requested-creative-files-to-requestor-same-day

The agent follows `SKILL.md`: it asks you for your request sheet and the design owner to copy, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `google-sheets`)
- `triggers/`: what starts it
