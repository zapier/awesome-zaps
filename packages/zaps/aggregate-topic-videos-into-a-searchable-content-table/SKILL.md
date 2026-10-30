---
name: aggregate-topic-videos-into-a-searchable-content-table
description: Build a Zapier Next Gen Zap that watches YouTube for new videos matching a topic and adds each matching video as a row in a Zapier Tables content table, so the library stays searchable for tagging and editorial scheduling. Use when you curate videos on a topic and want them collected in one searchable table instead of saved by hand.
metadata:
  author: zapier
  summary: "New YouTube videos on your topic are added to a searchable table with their title, channel, link, publish date and description, ready for tagging and scheduling."
  apps: "YouTube, Zapier Tables"
  category: "Personal Productivity"
  job: "News content feeds"
  source: "https://zapier.com/automations/personal-productivity/news-content-feeds/content-aggregation/aggregate-topic-videos-into-a-searchable-content-table"
---

# Aggregate topic videos into a searchable content table

## What it does

1. **Trigger:** YouTube, New Video by Search. It fires for each new video uploaded that matches your topic search string.
2. **Filter:** the run continues only if the video title contains your topic keyword. Other videos are skipped without writing anything.
3. **Zapier Tables** creates one record in your content table with the video's title, channel name, permalink, publish date and description.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** YouTube, New Video by Search (`video_search`). Its `query` parameter is `TOPIC_QUERY`.
2. **Connections** (each alias in the code is the app's slug):
   - `zapier-tables`: the user's Zapier Tables connection, for the account that owns the content table.
   - The YouTube trigger needs the user's YouTube connection.
3. **Constants:**
   - `TOPIC_QUERY`: the search string for new YouTube uploads, for example a topic name.
   - `TITLE_KEYWORD`: a word the video title must contain for the video to be kept. Usually the same as the topic.
   - `TABLE_ID`: the ID of the content table in Zapier Tables.
4. Test with the steps below, then publish, wait until the trigger is active, and check that new matching videos arrive in the table.

## Ask the user

- Which search topic should the trigger watch?
- Which keyword must a title contain for the video to be kept?
- Which Zapier Tables table is the content database, and does it have columns for title, channel, permalink, publish date and description?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a video whose title contains the keyword:

```json
{
  "title": "Example video about the topic",
  "channel": "Example Channel",
  "url": "https://www.youtube.com/watch?v=EXAMPLE",
  "published_at": "2026-10-29T10:00:00Z",
  "description": "A short description of the video."
}
```

Confirm that one new row appears in the content table with the five values filled in. Then run it again with a title that lacks the keyword and check that no row is added. Delete any test row afterwards.

## Customize

- **Normalize the data:** add a Formatter step to tidy the publish date or shorten the description before the row is created.
- **Notify editors:** add a Slack or email step after the row is created to alert editors about high-priority matches.

## Notes

- Each run creates a row for each new matching video. If the same video is found twice, it creates a second row. Add a duplicate check on the permalink before creating the row if that happens.
- Never commit a real table ID or a real topic that you do not want shared.
