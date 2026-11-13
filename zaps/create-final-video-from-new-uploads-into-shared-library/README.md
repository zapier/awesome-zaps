# Create final video from new uploads into shared library

When a new media file lands in your incoming Drive folder, it is sent to your render service, and the finished MP4 is saved into your shared library folder for editors.

**Apps:** Google Drive, Webhooks by Zapier

**Based on:** [Create final video from new uploads into shared library](https://zapier.com/automations/design/content-media-production/video-editing-workflow-management/create-final-video-from-new-uploads-into-shared-library) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-final-video-from-new-uploads-into-shared-library

The agent follows `SKILL.md`: it asks you for the incoming and library folders and your render service's endpoints, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`google-drive`)
- `triggers/`: what starts it
