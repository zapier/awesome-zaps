---
name: publish-planned-feature-releases-to-gtm-team-channel
description: Build a Zap on Zapier that posts each new release-tracker item to a GTM team Slack channel once its status is ready (Planned or Ready), with title, release date, audience, status and a link back to the Notion item. Use when a product team keeps launches in a Notion database and wants go-to-market stakeholders told as soon as a release is ready, without manual posts.
license: MIT
metadata:
  author: zapier
  summary: "When a feature release is marked planned or ready in your Notion tracker, the GTM team's Slack channel gets a short announcement with the release details and a link to the item."
  apps: "Notion, Slack"
  category: "Product"
  job: "Product launch management"
  source: "https://zapier.com/automations/product/product-launch-management/feature-announcement/publish-planned-feature-releases-to-gtm-team-channel"
---

# Publish planned feature releases to the GTM team channel

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/publish-planned-feature-releases-to-gtm-team-channel. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new item is created in your Notion release tracker database (`notion`, `new_data_source_item`).
2. **Filter:** the item's status must be one of the ready states (`Planned` or `Ready`). Anything else stops the run and posts nothing, so drafts stay out of the channel.
3. **Slack** posts one message to the GTM channel as a bot: the release title, release date, affected audience, status, and a link to the Notion item.

The Zap never @-mentions anyone or any channel, and drafts never reach the channel.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                 | What goes there                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| `NOTION_DATA_SOURCE_ID` | The release tracker database (data source) the trigger watches. Also set it as the trigger's data source. |
| `SLACK_CHANNEL`         | The channel ID of the GTM team channel, not its name.                                                     |

The tracker must be shared with the Notion connection first, so it appears in the trigger's dropdown.

Also review the defaults with them: `BOT_USERNAME` and `BOT_ICON` (the name and icon announcements appear under); `TITLE_FIELD`, `STATUS_FIELD`, `DATE_FIELD`, `AUDIENCE_FIELD` and `URL_FIELD` in `config.ts` (they must match the tracker's column names); and `READY_STATUSES` in `workflow.ts` (defaults `Planned` and `Ready`). Leave `ALLOW_MENTIONS` in `workflow.ts` as `false`.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` to the user's Slack connection for the workspace with the GTM channel, and `notion` (the trigger's account) to the user's Notion connection for the workspace with the release tracker.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-data-source-item.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's data source to the value of `NOTION_DATA_SOURCE_ID`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match. Check the Notion property names in `config.ts` against the tracker's columns.

## Test it

Run this sample as a draft test run before publishing, pointed at a test release item in a test copy of the tracker:

```json
{
  "id": "release-0001",
  "Name": "[install-test] Bulk export v2",
  "Status": "Planned",
  "Release Date": "2026-11-15",
  "Audience": "Enterprise admins",
  "URL": "https://www.notion.so/install-test-bulk-export-v2"
}
```

Check that one message appears in the GTM channel with the title, date, audience, status and link. Then send the same item with `"Status": "Draft"` and check that nothing is posted. If run-status tools aren't available, check the result in Slack directly. Then publish, confirm the trigger is active, and tell the user the Zap is live. The user deletes the test item and any test message, not the agent.

## Notes

- Only new items trigger the Zap. A release whose status changes to ready later will not post; that needs an "Updated Properties in Data Source Item" trigger instead.
- Each item ID posts at most once per run. Duplicate deliveries of the same item from Notion are not filtered across runs.
- The code flattens Notion rich-text values to plain text, so dates and text may look different from the Notion view.
- Anyone who can post to the channel can see announcements; use a channel the GTM team actually reads.
- To customize: DM the release owner or product lead when a release becomes ready, or add a checklist or launch links to the message with an extra formatting step.
