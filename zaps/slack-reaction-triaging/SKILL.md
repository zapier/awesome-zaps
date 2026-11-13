---
name: slack-reaction-triaging
description: Build a Zap on Zapier that posts a Slack message to a triage channel whenever someone reacts to a message with the ticket emoji, with the message text and a link to it. Use when support requests are raised in Slack by reacting to them and someone triages them from one channel.
license: MIT
metadata:
  author: zapier
  summary: "React to a Slack message with :ticket: and it's posted to your triage channel with a link back to it."
  apps: "Slack"
  category: "Customer Service & Success"
  job: "Customer support operations"
---

# Slack reaction to triage channel

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/slack-reaction-triaging. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** someone adds the :ticket: reaction to a message in the watched channel (`slack`, `new_reaction_added_v3`). The trigger brings the message text and its permalink.
2. **Slack** posts "Support request: <message text>" and the permalink to the triage channel.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve channel names to IDs with the user's Slack connection; don't ask them to paste an ID you can look up.

| Setting                      | Where                                            | What goes there                                      |
| ---------------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| `REPLACE_WATCHED_CHANNEL_ID` | `triggers/new-reaction-added.ts`, `conversation` | The channel whose messages get the :ticket: reaction |
| `SLACK_CHANNEL_ID`           | `config.ts`                                      | The channel that gets the triage posts               |

The two must be different channels, or a :ticket: on a triage post posts it again.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` to the user's Slack connection for the workspace with both channels. The trigger and the action use the same one.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-reaction-added.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the Slack action's fields with the user's connection before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with the triage channel set to one the user controls:

```json
{
  "message": {
    "raw_text": "[install-test] customer cannot log in",
    "permalink": "https://your-workspace.slack.com/archives/C0123456789/p0000000000000001"
  }
}
```

Check that one message appears in the triage channel with that text. If run-status tools aren't available, read the triage channel directly. Then publish, confirm the trigger is active, and do the real thing once: react to a message in the watched channel with :ticket: and check the triage channel. Ask the user to delete the test messages.

## Notes

- To watch every channel, remove `conversation` from the trigger. The triage channel is then watched too, so keep :ticket: off triage posts.
- To also open a helpdesk ticket, add a step after the post that creates one in the helpdesk app.
