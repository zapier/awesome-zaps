# Publish new meeting recordings to team video archive

When a Zoom cloud recording finishes, it is uploaded to your video library and a matching row in your archive table links to it, so anyone on the team can find it.

**Apps:** Zoom, Vimeo, Airtable

**Based on:** [Publish new meeting recordings to team video archive](https://zapier.com/automations/personal-productivity/photo-media-management/media-library-management/publish-new-meeting-recordings-to-team-video-archive) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/publish-new-meeting-recordings-to-team-video-archive

The agent follows `SKILL.md`: it asks you which Airtable base, table and columns hold the archive, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`airtable`, `vimeo`, `zoom`)
- `triggers/`: what starts it
