# Update design records with new render file download links

When a new render lands in your Dropbox folder, its share link is written into the matching design record in Notion, so the team can open the file from there.

**Apps:** Dropbox, Notion

**Based on:** [Update design records with new render file download links](https://zapier.com/automations/design/cad-technical-design/design-file-management/update-design-records-with-new-render-file-download-links) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-design-records-with-new-render-file-download-links

The agent follows `SKILL.md`: it asks you which Dropbox folder holds the renders and which Notion database holds the design records, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`dropbox`, `notion`)
- `triggers/`: what starts it
