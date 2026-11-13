# Save incoming client faxes and scans to cloud folder

When a fax or scanner PDF arrives by email, this saves it to your secure cloud folder under a dated filename, then marks the email as processed.

**Apps:** Gmail, Google Drive

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/save-incoming-client-faxes-and-scans-to-cloud-folder

The agent follows `SKILL.md`: it asks you for the Gmail label the scanner files into, the label that marks saved mail, the archive folder, and the Google account that owns it, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `google-drive`)
- `triggers/`: what starts it
