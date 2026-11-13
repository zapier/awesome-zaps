---
name: send-live-chat-inquiries-to-your-bookings-channel
description: Build a Zap on Zapier that posts new website live chat messages from external contacts into your team's Slack bookings channel, with the sender, a message preview and a link to the conversation. Use when a website live chat or chatbot sends messages to a webhook and coordinators want each inquiry in Slack as it arrives.
license: MIT
metadata:
  author: zapier
  summary: "When a visitor sends a live chat message, your bookings channel gets a short alert with who wrote, what they said and a link to the conversation, so coordinators can reply fast."
  apps: "Webhooks by Zapier, Slack"
  category: "Customer Service & Success"
  job: "Conversational support"
  source: "https://zapier.com/automations/customer-service-success/conversational-support/live-chat-management/send-live-chat-inquiries-to-your-bookings-channel"
---

# Send live chat inquiries to your bookings channel

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-live-chat-inquiries-to-your-bookings-channel. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a chat tool posts each new message to a Webhooks by Zapier catch hook (`webhook`, `hook_v2`).
2. **Filter:** if the payload's `sender_type` is not `external`, the run stops there. Internal and system messages never post.
3. **Slack** posts a message to the bookings channel. The bot name and icon are set in the code. The text has the sender's email in bold, a preview of the message (cut at 280 characters), and an "Open conversation" link to the chat.

Nothing is sent back to the chat or the visitor; coordinators reply in the chat tool themselves.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's Slack connection; don't ask them to paste an ID you can look up.

| Setting                       | What goes there                                                              |
| ----------------------------- | ---------------------------------------------------------------------------- |
| `REPLACE_BOOKINGS_CHANNEL_ID` | The Slack channel that gets the alerts: its ID (starts with C), not the name |

Also review the defaults with them: `BOT_NAME` and `BOT_ICON` in `config.ts` (the name and emoji or image URL shown on each alert), and `MESSAGE_PREVIEW_LENGTH` in `workflow.ts` (how many characters of the message show, 280 by default).

- What does the chat tool send? The code expects `sender_email`, `sender_type`, `message_text` and `conversation_url`. If the tool uses other field names, change the `InputSchema` keys in `workflow.ts` to match before installing.
- What value marks a message as coming from an outside contact? The code expects `sender_type: "external"`. Anything else is skipped.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` to the user's Slack connection for the workspace with the bookings channel, and make sure that connection is a member of that channel. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing:

```json
{
  "sender_email": "visitor@example.com",
  "sender_type": "external",
  "message_text": "Hi, do you have availability for a demo next Tuesday?",
  "conversation_url": "https://example.com/live-chat/conversation-id"
}
```

Check that one message appears in the bookings channel, with the bot name, the sender in bold, the message text and an "Open conversation" link. The run's Slack step output has the message's permalink, which is a good read-back. Then run the same sample with `"sender_type": "internal"`, and check that the run finishes as `skipped` with reason `not-an-external-contact` and that nothing appears in the channel.

If run-status tools aren't available, check the result in Slack directly. Ask the user to delete the test messages; the agent doesn't delete them. Then publish and confirm the trigger is active.

## Notes

- The alert is posted as a bot, so it can't be replied to from a person's name; coordinators reply in the chat tool through the link.
- After publishing, give the user the catch hook URL to point their chat tool at. Anyone with that URL can post into the bookings channel, so keep it out of shared documents and public repositories.
- To route high-intent messages to an on-call user or send a direct message to the booking owner, or to hide phone numbers or card details, add a step before the post.
