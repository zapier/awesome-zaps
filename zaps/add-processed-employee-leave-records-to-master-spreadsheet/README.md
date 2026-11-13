# Add processed employee leave records to master spreadsheet

Each processed leave record that arrives by webhook is added as a new row in your master HR spreadsheet, with dates in DD/MM/YYYY.

**Apps:** Webhooks by Zapier, Microsoft Excel

**Based on:** [Add processed employee leave records to master spreadsheet](https://zapier.com/automations/human-resources-hr/hr-operations/time-off-requests/add-processed-employee-leave-records-to-master-spreadsheet) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/add-processed-employee-leave-records-to-master-spreadsheet

The agent follows `SKILL.md`: it asks you for your master workbook and its worksheet, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`excel`)
- `triggers/`: what starts it
