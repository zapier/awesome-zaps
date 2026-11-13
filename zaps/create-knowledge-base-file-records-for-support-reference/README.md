# Create knowledge base file records for support reference

Every hour, the files in your HubSpot knowledge-base folder are added to a Zapier Table with their link and name, so support agents have one place to find them. Files already in the table are skipped.

**Apps:** Schedule by Zapier, HubSpot, Zapier Tables

**Based on:** [Create knowledge base file records for support reference](https://zapier.com/automations/customer-service-success/customer-support-operations/knowledge-base-management/create-knowledge-base-file-records-for-support-reference) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-knowledge-base-file-records-for-support-reference

The agent follows `SKILL.md`: it asks you which HubSpot folder holds the knowledge-base files and which Zapier Table holds the records, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`hubspot`, `zapier-tables`)
- `triggers/`: what starts it
