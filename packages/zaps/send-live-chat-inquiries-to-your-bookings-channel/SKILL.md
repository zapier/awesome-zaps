---
name: send-live-chat-inquiries-to-your-bookings-channel
description: Build a Zapier Next Gen Zap that posts new website live chat messages from external contacts into your team's Slack bookings channel, with the sender, a message preview and a link to the conversation. Use when a website live chat or chatbot sends messages to a webhook and coordinators want each inquiry in Slack as it arrives.
metadata:
  author: zapier
  summary: "When a visitor sends a live chat message, your bookings channel gets a short alert with who wrote, what they said and a link to the conversation, so coordinators can reply fast."
  apps: "Webhooks by Zapier, Slack"
  category: "Customer Service & Success"
  job: "Conversational support"
  source: "https://zapier.com/automations/customer-service-success/conversational-support/live-chat-management/send-live-chat-inquiries-to-your-bookings-channel"
---

# Send live chat inquiries to your bookings channel

## What it does

1. **Trigger:** a chat tool posts each new message to a Webhooks by Zapier catch hook.
2. **Filter:** if the payload's `sender_type` is not `external`, the run stops there. Internal and system messages never post.
3. **Slack** posts a message to the bookings channel. The bot name and icon are set in the code. The text has the sender's email in bold, a preview of the message (cut at 280 characters), and an "Open conversation" link to the chat.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `slack`: the Slack connection for the workspace that has the bookings channel.
3. **Constants:**
   - `BOOKINGS_CHANNEL_ID`: the Slack channel ID (starts with `C`), not the channel name.
   - `BOT_NAME` and `BOT_ICON`: the name and emoji or image URL shown on each alert.
   - `MESSAGE_PREVIEW_LENGTH`: how many characters of the message to show. Defaults to `280`.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point their chat tool at.

## Ask the user

- Which Slack channel is the bookings channel? Its ID goes in `BOOKINGS_CHANNEL_ID`.
- What does the chat tool send? The code expects `sender_email`, `sender_type`, `message_text` and `conversation_url`. If the tool uses other field names, change the `InputSchema` keys to match before installing.
- What value marks a message as coming from an outside contact? The code expects `sender_type: "external"`. Anything else is skipped.
- Should the bot name and icon be something other than "Live Chat Inquiries" and `:speech_balloon:`?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing:

```json
{
  "sender_email": "visitor@example.com",
  "sender_type": "external",
  "message_text": "Hi, do you have availability for a demo next Tuesday?",
  "conversation_url": "https://example.com/live-chat/conversation-id"
}
```

Confirm that one message appeared in the bookings channel, with the bot name, the sender in bold, the message text and an "Open conversation" link. The run's Slack step output has the message's permalink, which is a good read-back.

Then run the same sample with `"sender_type": "internal"`. Confirm the run finishes as `skipped` with reason `not-an-external-contact`, and that no message appears in the channel.

Delete the test message from the channel afterwards if it was a real channel.

## Customize

- **Route high-intent messages** to a dedicated on-call user, or send a direct message to the booking owner instead of the channel.
- **Shorten or redact** the message with a text formatter step before it posts, for example to hide phone numbers or card details.

## Notes

- The Slack message is posted as a bot, so it cannot be replied to from a person's name; coordinators reply in the chat tool through the link.
- The Slack connection must be a member of the bookings channel, or the post will fail. The code does not add it.
- Anyone with the webhook URL can post into the bookings channel. Keep it out of shared documents and public repositories.
- Never commit a real channel ID or webhook URL.
