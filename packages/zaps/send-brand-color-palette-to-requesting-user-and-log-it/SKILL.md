---
name: send-brand-color-palette-to-requesting-user-and-log-it
description: Build a Zapier Next Gen Zap that answers a /brand-colors slash command with the brand's color palette in Slack and logs each request to Airtable. Use when a team asks for brand colors through a chat command and you want requests tracked for audit.
metadata:
  author: zapier
  summary: "When someone asks for the brand colors with a slash command, they get the palette posted back in Slack and the request is logged in Airtable for tracking."
  apps: "Webhooks by Zapier, Airtable, Slack"
  category: "Design"
  job: "Brand management"
  source: "https://zapier.com/automations/design/brand-management/brand-guidelines-distribution/send-brand-color-palette-to-requesting-user-and-log-it"
---

# Send brand color palette to requesting user and log it

## What it does

1. **Trigger:** a slash command payload arrives at a Webhooks by Zapier catch hook (the chat platform posts to it).
2. **Airtable** looks for an existing request row with the same requester ID. If there is none, it creates a row with the requester, command, text and origin channel.
3. **Slack** posts the brand palette to a channel, with the primary and complementary colors.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `airtable`: the Airtable account that owns the request log.
   - `slack`: the Slack workspace account that can post to the channel.
3. **Constants:**
   - `AIRTABLE_BASE_ID`: the long ID in the base's URL.
   - `AIRTABLE_TABLE_NAME`: the table that holds one row per request.
   - `AIRTABLE_REQUESTER_ID_FIELD`, `AIRTABLE_REQUESTER_NAME_FIELD`, `AIRTABLE_COMMAND_FIELD`, `AIRTABLE_MESSAGE_FIELD`, `AIRTABLE_ORIGIN_FIELD`: the table's column names, matched exactly.
   - `SLACK_CHANNEL_ID`: the channel the palette is posted to.
   - `RESOURCE_PREFIX`: a prefix on everything the workflow creates. Test runs use `[install-test] `; set it to `""` once installed.
   - `PRIMARY_COLORS`, `COMPLEMENTARY_COLORS`: the brand's palette.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point their chat platform at.

## Ask the user

- Which Airtable base and table hold the request log, and what are the column names for requester ID, requester name, command, message note and origin?
- Which Slack channel should receive the palette?
- What are the brand's primary and complementary colors?
- Does the chat platform post the slash-command fields as `user_id`, `user_name`, `command`, `text` and `channel_id`? If not, tell them before installing; the code reads those names.

## Test

When the connections are live, run this sample as a draft test run (`run_workflow_draft`) before publishing:

```json
{
  "user_id": "UTEST0001",
  "user_name": "install-test",
  "command": "/brand-colors",
  "text": "[install-test] palette request",
  "channel_id": "C02M7813E"
}
```

Check that: a row is created in the request table with `[install-test] install-test` as the requester name; the palette message appears once in the test channel with the `[install-test] ` prefix; and running it again with the same `user_id` creates no second row.

## Customize

- **Send the palette as a direct message to the requester** instead of a channel post. This needs a DM target for the requester that isn't built here.
- **Use Slack blocks** (header and sections) for a richer layout. The channel message action takes plain text, so this version posts mrkdwn text.
- **Mobile summary:** send a condensed message instead of the full palette for mobile recipients.
- **Channel log:** append a log entry when the command is invoked from a public channel.

## Notes

- Check them on the first real run.
- Anyone who can post to the webhook URL can request the palette and create rows. Keep the URL private.
- Never commit a real base ID, channel ID or webhook URL.
