# Log legal entries from new spreadsheet rows automatically

Each new row added to your Excel intake table becomes a legal entry record in a Zapier Table, so compliance staff work from one source of truth.

**Apps:** Microsoft Excel, Zapier Tables

**Based on:** [Log legal entries from new spreadsheet rows automatically](https://zapier.com/automations/legal/compliance-management/compliance-task-tracking/log-legal-entries-from-new-spreadsheet-rows-automatically) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/log-legal-entries-from-new-spreadsheet-rows-automatically

The agent follows `SKILL.md`: it asks you for your intake workbook, worksheet and table, the Zapier Table for legal entries, and your column headers, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`excel`, `zapier-tables`)
- `triggers/`: what starts it
