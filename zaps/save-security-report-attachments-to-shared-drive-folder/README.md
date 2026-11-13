# Save security report attachments to shared drive folder

When a security report email arrives, its attachments are saved to your shared drive folder with the received date, and the email is labelled so it is clearly processed.

**Apps:** Gmail, Google Drive

**Based on:** [Save security report attachments to shared drive folder](https://zapier.com/automations/it/security-compliance/compliance-evidence-collection/save-security-report-attachments-to-shared-drive-folder) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/save-security-report-attachments-to-shared-drive-folder

The agent follows `SKILL.md`: it asks you for the Gmail search, the subject and recipient text, the Drive folder and the processed label, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `google-drive`)
- `triggers/`: what starts it
