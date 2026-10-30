---
name: post-reaction-tagged-support-requests-to-ops-triage-channel
description: Build a Zapier Next Gen Zap that posts a Slack message to an ops triage channel whenever a teammate adds a support reaction to a message, with the requester, a permalink and the raw message text. Use when support requests are raised in Slack by reacting to a message and a triage coordinator needs them in one place without copying links by hand.
metadata:
  author: zapier
  summary: "When a teammate marks a Slack message with a support reaction, the message, its author and a link to it are posted to your triage channel so coordinators can act on it right away."
  apps: "Slack"
  category: "Customer Service & Success"
  job: "Customer support operations"
  source: "https://zapier.com/automations/customer-service-success/customer-support-operations/ticket-routing/post-reaction-tagged-support-requests-to-ops-triage-channel"
---

# Post reaction-tagged support requests to ops triage channel

## What it does

1. **Trigger:** Slack, New Reaction Added in a Channel (`new_reaction_added_v3`). It fires when the support reaction is added to a message in the source channel. It attaches the message's text, its author's ID, its channel and a permalink.
2. **Slack** looks up the message author by ID and takes their real name. If the lookup fails, the run carries on with the author's ID instead.
3. **Slack** posts one bot message to the triage channel: the source channel name, the requester, the permalink and the raw message text. Mentions are off, so the post pings nobody.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top of the file.

1. **Trigger:** Slack, New Reaction Added in a Channel (`slack`, action `new_reaction_added_v3`). Set its parameters:
   - Channel ID: the value of `SOURCE_CHANNEL`.
   - Reaction: `ticket`, or whatever `SUPPORT_REACTION` says.
   - Reacted message detail: `content` (raw text, no extra API calls).
   - Include additional data: `permalink`.
2. **Connections** (each alias in the code is the app's slug, as in the reference):
   - `slack`: the user's Slack connection, the workspace where the source and triage channels live. The same connection is used for the trigger and both actions.
3. **Constants** (each has a comment in `workflow.ts`):
   - `TRIAGE_CHANNEL`: the Slack channel ID to post triage messages to. Use the ID, not the channel name.
   - `SOURCE_CHANNEL`: the Slack channel ID the reaction is watched in. It must also be the trigger's Channel ID.
   - `SUPPORT_REACTION`: the reaction name, without colons. Defaults to `ticket`.
   - `BOT_NAME` and `BOT_ICON`: the name and icon the bot posts under.
   - `ALLOW_MENTIONS`: `false` by default. Set to `true` only if triage posts should ping people.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user nothing to paste: a Slack trigger needs no webhook URL.

## Ask the user

- Which Slack channel is the support-request source, and which is the triage channel? Get both channel IDs (the `C…` IDs in the channel's details).
- Which reaction marks a support request? The default is `ticket`.
- Should triage posts use the default bot name and icon, or a different one?
- Should triage posts @-mention anyone? The default is no.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a channel you control for both the source and triage channel, and a message author who is a real member of the workspace:

```json
{
  "reaction": "ticket",
  "conversation": "C0123456789",
  "message": {
    "raw_text": "[install-test] sample support request: customer cannot log in",
    "permalink": "https://your-workspace.slack.com/archives/C0123456789/p0000000000000001",
    "channel": { "name": "testing" },
    "user": { "id": "U0123456789" }
  }
}
```

Replace the channel and user IDs with real ones from the test channel. Then confirm: the run finishes, the requester lookup returns a real name, and one bot message appears in the triage channel with that name, the permalink and the raw text. Then tell the user to delete the test message.

## Customize

- **Create a helpdesk ticket** for qualifying requests: add a step after the post that creates a ticket in the helpdesk app, filtered on the message text or the channel.
- **Acknowledge the requester:** add a direct message step to the original author, sent after the triage post, once the request is in the triage channel.

## Notes

- The trigger fires on the reaction, not on the message. A reaction on a thread reply posts the reply's text; the permalink opens the exact reply only if the trigger's message detail is set to a level above `content`.
- The workflow reads only the source channel. A reaction in another channel is skipped by the trigger filter and, as a second check, by the code.
- The requester lookup is wrapped so a failed lookup never stops the post. If it fails, the triage message shows the author's Slack user ID instead of a name.
- Never commit real channel IDs, user IDs or webhook URLs; `workflow.ts` here carries placeholders only.
