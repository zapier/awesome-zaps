---
name: aggregate-topic-videos-into-a-searchable-content-table
description: Build a Zap on Zapier that watches YouTube for new videos matching a topic and adds each matching video as a row in a Zapier Tables content table, so the library stays searchable for tagging and editorial scheduling. Use when you curate videos on a topic and want them collected in one searchable table instead of saved by hand.
license: MIT
metadata:
  author: zapier
  summary: "New YouTube videos on your topic are added to a searchable table with their title, channel, link, publish date and description, ready for tagging and scheduling."
  apps: "YouTube, Zapier Tables"
  category: "Personal Productivity"
  job: "News content feeds"
  source: "https://zapier.com/automations/personal-productivity/news-content-feeds/content-aggregation/aggregate-topic-videos-into-a-searchable-content-table"
---

# Aggregate topic videos into a searchable content table

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/aggregate-topic-videos-into-a-searchable-content-table. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** YouTube, New Video by Search (`youtube`, `video_search`). It fires for each new video uploaded that matches your topic search string.
2. **Filter:** the run continues only if the video title contains your keyword. Other videos are skipped without writing anything.
3. **Zapier Tables** creates one record in your content table with the video's title, channel name, permalink, publish date and description.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting         | What goes there                                                                             |
| --------------- | ------------------------------------------------------------------------------------------- |
| `TOPIC_QUERY`   | The search string the YouTube trigger watches for new uploads: your topic                   |
| `TITLE_KEYWORD` | A word the video title must contain for the video to be kept. Usually the same as the topic |
| `TABLE_ID`      | The content table in Zapier Tables that receives rows                                       |

The content table needs columns for title, channel, permalink, publish date and description.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `zapier-tables` to the user's Zapier Tables connection for the account that owns the content table. The YouTube trigger uses the user's `youtube` connection, set from `connections/youtube.ts`.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/video-search.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger, if it has one, before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

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

Confirm that one new row appears in the content table with the five values filled in. Then run it again with a title that lacks the keyword and check that no row is added. If run-status tools aren't available, check the result in Zapier Tables directly. The user deletes the test row afterwards, not the agent.

Then publish, confirm the trigger is active, and check that new matching videos arrive in the table.

## Notes

- Each run creates a row for each new matching video. If the same video is found twice, it creates a second row. Add a duplicate check on the permalink before creating the row if that happens.
- To tidy the data, add a Formatter step to shorten the description or format the publish date before the row is created.
- To alert editors, add a Slack or email step after the row is created for high-priority matches.
- Keep real table IDs and topics you do not want shared out of commits.
