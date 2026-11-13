---
name: send-brand-color-palette-to-requesting-user-and-log-it
description: Build a Zap on Zapier that answers a /brand-colors slash command with the brand's color palette in Slack and logs each request to Airtable. Use when a team asks for brand colors through a chat command and you want requests tracked for audit.
license: MIT
metadata:
  author: zapier
  summary: "When someone asks for the brand colors with a slash command, they get the palette posted back in Slack and the request is logged in Airtable for tracking."
  apps: "Webhooks by Zapier, Airtable, Slack"
  category: "Design"
  job: "Brand management"
  source: "https://zapier.com/automations/design/brand-management/brand-guidelines-distribution/send-brand-color-palette-to-requesting-user-and-log-it"
---

# Send brand color palette to requesting user and log it

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-brand-color-palette-to-requesting-user-and-log-it. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a slash command arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). The chat platform posts the command to it.
2. **Airtable** looks for an existing request row with the same requester ID. If there is none, it creates a row with the requester, command, text and origin channel.
3. **Slack** posts the brand palette to the channel, with the primary and complementary colors.

A requester gets one row: repeat requests post the palette again but add no second row.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                       | What goes there                                         |
| ----------------------------- | ------------------------------------------------------- |
| `REPLACE_AIRTABLE_BASE_ID`    | The Airtable base that holds the request log            |
| `REPLACE_AIRTABLE_TABLE_NAME` | The table in that base with one row per palette request |
| `REPLACE_SLACK_CHANNEL_ID`    | The Slack channel that receives the palette             |

Also review the defaults with them: the column names in `config.ts` (`AIRTABLE_REQUESTER_ID_FIELD`, `AIRTABLE_REQUESTER_NAME_FIELD`, `AIRTABLE_COMMAND_FIELD`, `AIRTABLE_MESSAGE_FIELD`, `AIRTABLE_ORIGIN_FIELD`), which must match the table's field names exactly; `RESOURCE_PREFIX`, which is `[install-test] ` for testing and `""` once installed; and `PRIMARY_COLORS` and `COMPLEMENTARY_COLORS` at the top of `workflow.ts`, which should be the brand's palette.

Confirm the chat platform posts the slash-command fields as `user_id`, `user_name`, `command`, `text` and `channel_id`. If it doesn't, tell the user before installing, because the code reads those names.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `airtable` (the account that owns the request log) and `slack` (a workspace account that can post to the channel) to the user's connections. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test (`run_workflow_draft`) before publishing:

```json
{
  "user_id": "UTEST0001",
  "user_name": "install-test",
  "command": "/brand-colors",
  "text": "[install-test] palette request",
  "channel_id": "C02M7813E"
}
```

Check that a row is created in the request table with `[install-test] install-test` as the requester name, that the palette message appears once in the test channel with the `[install-test] ` prefix, and that running it again with the same `user_id` creates no second row. If run-status tools aren't available, check the result in Airtable and Slack directly. Then publish, confirm the trigger is active, and give the user their webhook URL to point their chat platform at. Ask the user to delete the test row and message, not the agent.

## Notes

- Check the defaults on the first real run.
- Anyone who can post to the webhook URL can request the palette and create rows, so keep the URL private. Never commit a real base ID, channel ID or webhook URL.
- Not built here: a direct message to the requester (needs a DM target), Slack blocks for a richer layout (the channel message action takes plain text), a condensed mobile summary, and a log entry for requests from public channels.
