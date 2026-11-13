# Save new build artifacts into organized release folder

When a new build artifact lands in your source folder, a timestamped copy is saved into your release folder, so teams can find reproducible files without filing them by hand.

**Apps:** Google Drive

**Based on:** [Save new build artifacts into organized release folder](https://zapier.com/automations/engineering/software-delivery/release-management/save-new-build-artifacts-into-organized-release-folder) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/save-new-build-artifacts-into-organized-release-folder

The agent follows `SKILL.md`: it asks you for the Drive folder that receives the build artifacts and the folder that holds the release copies, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`google-drive`)
- `triggers/`: what starts it
