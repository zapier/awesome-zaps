# Update chatbot FAQ records from edited sheet rows

When someone edits an answer in your FAQ sheet, the matching record in your Zapier Table is updated (or created if the question is new), so your chatbot always uses the latest answer.

**Apps:** Google Sheets, Zapier Tables

**Based on:** [Update chatbot FAQ records from edited sheet rows](https://zapier.com/automations/customer-service-success/self-service-support/faq-help-center-management/update-chatbot-faq-records-from-edited-sheet-rows) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-chatbot-faq-records-from-edited-sheet-rows

The agent follows `SKILL.md`: it asks you for your master FAQ sheet and the Zapier Table your chatbot reads, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`google-sheets`)
- `triggers/`: what starts it
