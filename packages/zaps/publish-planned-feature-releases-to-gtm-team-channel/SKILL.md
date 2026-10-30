---
name: publish-planned-feature-releases-to-gtm-team-channel
description: Build a Zapier Next Gen Zap that posts each new release-tracker item to a GTM team Slack channel once its status is ready (Planned or Ready), with title, release date, audience, status and a link back to the Notion item. Use when a product team keeps launches in a Notion database and wants go-to-market stakeholders told as soon as a release is ready, without manual posts.
metadata:
  author: zapier
  summary: "When a feature release is marked planned or ready in your Notion tracker, the GTM team's Slack channel gets a short announcement with the release details and a link to the item."
  apps: "Notion, Slack"
  category: "Product"
  job: "Product launch management"
  source: "https://zapier.com/automations/product/product-launch-management/feature-announcement/publish-planned-feature-releases-to-gtm-team-channel"
---

# Publish planned feature releases to the GTM team channel

## What it does

1. **Trigger:** a new item is created in your Notion release tracker database (Notion, New Data Source Item).
2. **Filter:** the item's status must be one of the ready states (`Planned` or `Ready`). Anything else stops the run and posts nothing, so drafts stay out of the channel.
3. **Slack** posts one message to the GTM channel as a bot: the release title, release date, affected audience, status, and a link to the Notion item.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**Check the fields first:** with the user's own connections, inspect the Notion trigger's fields and each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run. The property names read from the Notion item (`Name`, `Status`, `Release Date`, `Audience`, `URL`) are the names in the user's tracker; change the constants if the columns are named differently.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Notion, New Data Source Item (`notion`, `new_data_source_item`). Set the trigger's data source to the same ID as `NOTION_DATA_SOURCE_ID`. The trigger uses the user's Notion connection.
2. **Connections** (each alias in the code is the app's slug):
   - `notion`: the user's Notion connection, for the workspace that holds the release tracker.
   - `slack`: the user's Slack connection for the workspace where the GTM channel lives.
3. **Constants:**
   - `NOTION_DATA_SOURCE_ID`: the ID of the release tracker database (data source) the trigger watches. Also set it in the trigger.
   - `SLACK_CHANNEL`: the channel ID of the GTM team channel, not its name (open the channel's details to copy its ID).
   - `BOT_USERNAME`, `BOT_ICON`: the name and icon the announcements appear under.
   - `READY_STATUSES`: the Notion status values that count as ready.
   - `ALLOW_MENTIONS`: leave `false` so announcements never ping people or channels.
   - `TITLE_FIELD`, `STATUS_FIELD`, `DATE_FIELD`, `AUDIENCE_FIELD`, `URL_FIELD`: the Notion property names to read.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user the workflow is live.

## Ask the user

- Which Notion database is the release tracker? Share it with the Notion connection so it appears in the trigger's dropdown.
- Which Slack channel is the GTM team channel? Give its channel ID.
- What are the status names for ready releases? The defaults are `Planned` and `Ready`.
- What are the property names for title, status, release date, audience and URL in the tracker?
- Should the bot use a different name and icon?

## Test

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

Check that one message appears in the GTM channel with the title, date, audience, status and link. Then send the same item with `"Status": "Draft"` and check that nothing is posted. Afterwards, delete the test item and any test message.

## Customize

- **Also DM the release owner or product lead** when a release's status escalates to ready.
- **Add a checklist or launch links** to the message with an extra formatting step.

## Notes

- The workflow only reacts to new items. A release whose status changes to ready later will not post; that needs an "Updated Properties in Data Source Item" trigger instead.
- Each item ID posts at most once per run. Duplicate deliveries of the same item from Notion are not filtered across runs.
- Notion may show dates and rich text differently than the sample; the code flattens rich-text values to plain text.
- Anyone who can post to the channel can see announcements; use a channel that the GTM team actually reads.
