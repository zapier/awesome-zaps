---
name: create-weekly-video-performance-summaries-for-reporting-dashboards
description: Build a Zap on Zapier that takes a YouTube video ID and a date range and returns that video's views, average watch time, engagement percentage, revenue and subscriber change, ready for a reporting dashboard. Use when a dashboard, spreadsheet or another workflow needs per-video YouTube performance summaries for a reporting period.
license: MIT
metadata:
  author: zapier
  summary: "Give it a YouTube video and a date range, and it returns that video's views, watch time, engagement, revenue and subscriber change in one payload for your dashboard."
  apps: "Webhooks by Zapier, YouTube"
  category: "Data & Analytics"
  job: "Data visualization"
  source: "https://zapier.com/automations/data-analytics/data-visualization/automated-report-creation/create-weekly-video-performance-summaries-for-reporting-dashboards"
---

# Create weekly video performance summaries for reporting dashboards

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-weekly-video-performance-summaries-for-reporting-dashboards. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a request arrives at a catch hook (`webhook`, `hook_v2`) carrying `video_id`, `start_date` and `end_date`.
2. **YouTube** (`youtube`) runs a Get Report (Top Videos breakdown) on the channel, filtered to that video ID, for the date range, requesting views, watch time, likes, comments, shares, estimated revenue and subscribers gained and lost.
3. The first row of the report is reduced to the summary: views, average watch time (seconds), engagement percentage ((likes + comments + shares) / views), revenue, and subscriber delta (gained minus lost). If there's no data, every value is zero.

The Zap only reads from YouTube. It writes nothing to the channel.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting              | What goes there                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| `REPLACE_CHANNEL_ID` | The YouTube channel the videos belong to, as its `UC…` ID; look it up with the user's YouTube connection |

Also review the default with them: `METRICS` (the report columns; change these only if they want different columns).

Before building, ask:

- Which YouTube connection should the Zap use? It must be a connected account that owns or manages the channel.
- What does the sender post? The payload must carry `video_id`, `start_date` (`YYYY-MM-DD`) and `end_date` (`YYYY-MM-DD`). If the sender uses other field names, change them in `workflow.ts` before installing.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `youtube` to the user's YouTube connection for the account that owns or manages the channel to report on. The trigger, `webhook`, needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with `REPLACE_CHANNEL_ID` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connection and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample once as a draft test before publishing, using a video that exists on the channel:

```json
{
  "video_id": "VIDEO_ID_ON_THE_CHANNEL",
  "start_date": "2026-10-19",
  "end_date": "2026-10-25"
}
```

Check that the returned payload has the video's own views and that the engagement percentage is consistent with its likes, comments and shares. For a video with no activity in the range, check that the values are zero and `reason` is `no-report-data`. Draft test runs can't confirm the row's field names until a real report has run, so compare the step's output against the YouTube result before trusting the mapping. If run-status tools aren't available, check the result in YouTube directly. Any test data is the user's to delete, not the agent's.

## Notes

- The workflow returns its summary in the run output. A catch hook can't return a value to the sender, so the caller reads results from the run, or from a later step that writes them somewhere.
- Engagement percentage is a derived figure (likes, comments and shares over views). Change the formula in `workflow.ts` if the dashboard defines engagement differently.
- To write each summary to Google Sheets for archival reporting, add a Google Sheets step after the summary that appends one row. To alert on thresholds, post a Slack message when revenue or engagement crosses a set value.
- Keep the webhook URL private. Anyone with it can request reports.
