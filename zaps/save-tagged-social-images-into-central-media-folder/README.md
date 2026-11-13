# Save tagged social images into central media folder

When someone tags your Instagram account, their photo or video is copied into your shared media folder with the uploader's name and the post time in the filename, so the team can reuse it.

**Apps:** Instagram for Business, Google Drive

**Based on:** [Save tagged social images into central media folder](https://zapier.com/automations/design/creative-operations/asset-management/save-tagged-social-images-into-central-media-folder) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/save-tagged-social-images-into-central-media-folder

The agent follows `SKILL.md`: it asks you for your shared media folder and the Instagram account to watch, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-drive`, `instagram-for-business`)
- `triggers/`: what starts it
