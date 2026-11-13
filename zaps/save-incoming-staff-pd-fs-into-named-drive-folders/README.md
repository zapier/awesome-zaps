# Save incoming staff PDFs into named Drive folders

Each PDF a staff member emails you is filed into a Drive folder named after the email's subject, so the documents are easy to find later.

**Apps:** Gmail, Google Drive

**Based on:** [Save incoming staff PDFs into named Drive folders](https://zapier.com/automations/business-owners/business-document-management/document-archival-retrieval/save-incoming-staff-pd-fs-into-named-drive-folders) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/save-incoming-staff-pd-fs-into-named-drive-folders

The agent follows `SKILL.md`: it asks you which Gmail account receives the staff PDFs and which Drive folder holds the staff folders, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`gmail`)
- `triggers/`: what starts it
