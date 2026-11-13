---
name: post-reaction-tagged-support-requests-to-ops-triage-channel
description: Build a Zap on Zapier that posts a Slack message to an ops triage channel whenever a teammate adds a support reaction to a message, with the requester, a permalink and the raw message text. Use when support requests are raised in Slack by reacting to a message and a triage coordinator needs them in one place without copying links by hand.
license: MIT
metadata:
  author: zapier
  summary: "When a teammate marks a Slack message with a support reaction, the message, its author and a link to it are posted to your triage channel so coordinators can act on it right away."
  apps: "Slack"
  category: "Customer Service & Success"
  job: "Customer support operations"
  source: "https://zapier.com/automations/customer-service-success/customer-support-operations/ticket-routing/post-reaction-tagged-support-requests-to-ops-triage-channel"
---

# Post reaction-tagged support requests to ops triage channel

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/post-reaction-tagged-support-requests-to-ops-triage-channel. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new reaction in Slack (`slack`, `new_reaction_added_v3`). It fires when the support reaction is added to a message in the source channel and attaches the message's text, its author's ID, its channel and a permalink.
2. **Slack** looks up the message author by ID and takes their real name. If the lookup fails, the run carries on with the author's ID instead.
3. **Slack** posts one bot message to the triage channel: the source channel name, the requester, the permalink and the raw message text.

The Zap only posts to the triage channel. It never messages the requester or changes the original message. Mentions are off, so the post pings nobody.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting          | What goes there                                                                                                             | Where                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `TRIAGE_CHANNEL` | The Slack channel the triage messages are posted to: look up its ID (starts with `C`) from the channel name the user gives  | `config.ts`                                                                   |
| `SOURCE_CHANNEL` | The Slack channel the support reaction is watched in: look up its ID (starts with `C`) from the channel name the user gives | `config.ts`, and the trigger's Channel ID in `triggers/new-reaction-added.ts` |

Also review the defaults with them: `SUPPORT_REACTION` (`ticket`, the reaction name without colons), `BOT_NAME` and `BOT_ICON` (the name and icon the bot posts under), and `ALLOW_MENTIONS` in `workflow.ts` (`false`; set it to `true` only if triage posts should ping people).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` to the user's Slack connection, the workspace where the source and triage channels live. The same connection serves the trigger and both posting and lookup steps.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/<file>.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a test channel you control for both the source and triage channels, and a message author who is a real member of the workspace:

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

Check that the run finishes, the requester lookup returns a real name, and one bot message appears in the triage channel with that name, the permalink and the raw text. If run-status tools aren't available, check the result in Slack directly. The user deletes the test message, not the agent.

## Notes

- The trigger fires on the reaction, not on the message. A reaction on a thread reply posts the reply's text; the permalink opens the exact reply only if the trigger's message detail is set to a level above `content`.
- Only the source channel is read. A reaction in another channel is skipped by the trigger filter and, as a second check, by the code.
- A failed requester lookup never stops the post. The triage message then shows the author's Slack user ID instead of a name.
- To extend it: create a helpdesk ticket for qualifying requests, or send the original author a direct message after the post.
- Never commit real channel IDs, user IDs or webhook URLs; `config.ts` carries placeholders only.
