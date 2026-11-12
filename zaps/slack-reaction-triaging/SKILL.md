---
name: slack-reaction-triaging
description: Build a Zapier Next Gen Zap that posts a Slack message to a triage channel whenever someone reacts to a message with the ticket emoji, with the message text and a link to it. Use when support requests are raised in Slack by reacting to them and someone triages them from one channel. This is the zap zapier.sh shows on its homepage.
license: MIT
metadata:
  author: zapier
  summary: "React to a Slack message with :ticket: and it's posted to your triage channel with a link back to it."
  apps: "Slack"
  category: "Customer Service & Success"
  job: "Customer support operations"
---

# Slack reaction to triage channel

## What it does

1. **Trigger:** Slack, New Reaction Added in a Channel (`new_reaction_added_v3`). It fires when someone adds the `ticket` reaction to a message in the watched channel, and attaches the message's raw text and its permalink.
2. **Slack** posts `Support request: <message text>` and the permalink to the triage channel.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** the files in this folder are the whole zap. `workflow.ts` is the workflow. It imports its setting from `config.ts` and its account from `connections/slack.ts`, and `triggers/` holds what starts it.

- **With the zap CLI:** `npx zap-pack add awesome-zaps/slack-reaction-triaging` (it makes a zap project if you aren't in one), then `npx zap-pack deploy slack-reaction-triaging` from that project. Deploy asks for the triage channel, the watched channel and the Slack account, and sets the trigger.
- **With Zapier MCP:** publish every `.ts` file outside `triggers/` as `sourceFiles`, with three changes: write `config.ts` as plain values (`export const SLACK_CHANNEL_ID = "value";`), write `connections/slack.ts` as `export default "slack";`, and write each `@/name` import as a relative path ending in `.ts` (`./config.ts`, `./connections/slack.ts`). Set the trigger from the file in `triggers/`.

1. **Trigger:** Slack, New Reaction Added in a Channel (`slack`, action `new_reaction_added_v3`). Set its parameters:
   - Reaction: `ticket`.
   - Channel ID: the channel to watch, which the user picks.
   - Reacted message detail: `content`. Left blank, the trigger sends no message text.
   - Include additional data: `permalink`.
2. **Connections** (each alias in the code is the app's slug, as in the reference):
   - `slack`: the user's Slack connection, the workspace with both channels. The trigger and the action use the same one.
3. **Settings** (in `config.ts`; an `ask(…)` is asked when each person deploys):
   - `SLACK_CHANNEL_ID`: the Slack channel ID triage posts go to. Use the ID, not the channel name.
4. Test with the steps below, then publish and wait until the trigger is active. A Slack trigger needs no webhook URL.

## Ask the user

- Which channel should the `ticket` reaction be watched in?
- Which channel gets the triage posts? Get its channel ID (the `C…` ID in the channel's details).

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP, or `npx zap-pack run slack-reaction-triaging --input '…'`), with a triage channel you control:

```json
{
  "message": {
    "raw_text": "[install-test] customer cannot log in",
    "permalink": "https://your-workspace.slack.com/archives/C0123456789/p0000000000000001"
  }
}
```

Confirm the run finishes and one message appears in the triage channel with that text. Then do the real thing once: react to a message in the watched channel with `:ticket:` and check the triage channel. Tell the user to delete the test messages.

## Customize

- **Create a helpdesk ticket** as well: add a step after the post that creates a ticket in the helpdesk app.
- **Watch every channel:** remove `conversation` from the trigger file.

## Notes

- Use different channels for watching and triage, or a `:ticket:` on a triage post posts it again.
- Never commit real channel IDs; `config.ts` carries an `ask(…)`, and each person's answer stays in their `.zap.json`.
