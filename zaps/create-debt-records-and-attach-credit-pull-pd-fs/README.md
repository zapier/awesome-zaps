# Create debt records and attach credit pull PDFs

When a credit-pull request arrives, the credit report is requested and its PDF captured, so the client's file is ready without manual pulls.

**Apps:** Webhooks by Zapier

**Based on:** [Create debt records and attach credit pull PDFs](https://zapier.com/automations/finance/accounts-receivable/credit-management/create-debt-records-and-attach-credit-pull-pd-fs) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-debt-records-and-attach-credit-pull-pd-fs

The agent follows `SKILL.md`: it asks you for your credit-report API endpoint and the default country code for phone numbers, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `triggers/`: what starts it
