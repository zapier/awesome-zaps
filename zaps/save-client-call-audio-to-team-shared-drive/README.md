# Save client call audio to team shared drive

When a Zoom cloud recording finishes, its audio is saved to the team's Dropbox folder with the client's name and the call date, and the meeting is logged in a Zapier Table.

**Apps:** Zoom, Zapier Tables, Dropbox

**Based on:** [Save client call audio to team shared drive](https://zapier.com/automations/personal-productivity/file-management/cloud-file-sync/save-client-call-audio-to-team-shared-drive) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/save-client-call-audio-to-team-shared-drive

The agent follows `SKILL.md`: it asks you which Zapier table logs the calls and which Dropbox folder gets the audio, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`zoom`, `zapier-tables`, `dropbox`)
- `triggers/`: what starts it
