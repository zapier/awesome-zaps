# Attach new design files to matching project card

When a design file lands in your shared Dropbox folder, it is attached to the Trello card with the same name, so reviewers find it on the card.

**Apps:** Dropbox, Trello

**Based on:** [Attach new design files to matching project card](https://zapier.com/automations/design/cad-technical-design/design-file-management/attach-new-design-files-to-matching-project-card) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/attach-new-design-files-to-matching-project-card

The agent follows `SKILL.md`: it asks you for the Dropbox folder that holds the design files and the Trello board with the project cards, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`dropbox`, `trello`)
- `triggers/`: what starts it
