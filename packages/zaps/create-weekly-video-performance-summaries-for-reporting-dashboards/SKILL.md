---
name: create-weekly-video-performance-summaries-for-reporting-dashboards
description: Build a Zapier Next Gen Zap that takes a YouTube video ID and a date range and returns that video's views, average watch time, engagement percentage, revenue and subscriber change, ready for a reporting dashboard. Use when a dashboard, spreadsheet or another workflow needs per-video YouTube performance summaries for a reporting period.
metadata:
  author: zapier
  summary: "Give it a YouTube video and a date range, and it returns that video's views, watch time, engagement, revenue and subscriber change in one payload for your dashboard."
  apps: "Webhooks by Zapier, YouTube"
  category: "Data & Analytics"
  job: "Data visualization"
  source: "https://zapier.com/automations/data-analytics/data-visualization/automated-report-creation/create-weekly-video-performance-summaries-for-reporting-dashboards"
---

# Create weekly video performance summaries for reporting dashboards

## What it does

1. **Trigger:** a request arrives at a Webhooks by Zapier catch hook carrying `video_id`, `start_date` and `end_date`.
2. **YouTube** runs a Get Report (Top Videos breakdown) on your channel, filtered to that video ID, for the date range, requesting views, watch time, likes, comments, shares, estimated revenue and subscribers gained and lost.
3. The first row of the report is reduced to the summary: views, average watch time (seconds), engagement percentage ((likes + comments + shares) / views), revenue, and subscriber delta (gained minus lost). If there's no data, every value is zero.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `youtube`: the user's YouTube connection, for the account that owns the channel to report on.
3. **Constants:**
   - `CHANNEL_ID`: the `UC…` ID of the YouTube channel the videos belong to.
   - `METRICS`: the report metrics. Change these only if you want different columns.

## Ask the user

- Which YouTube channel do the videos belong to? (Set `CHANNEL_ID`.)
- Which YouTube connection should the workflow use? (It must be a connected account that owns or manages that channel.)
- What does the sender post? The payload must carry `video_id`, `start_date` (`YYYY-MM-DD`) and `end_date` (`YYYY-MM-DD`). If the sender uses other field names, tell the workflow before installing.

## Test

The test plan, to run once the YouTube connection is reconnected:

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, using a video that exists on the channel:

```json
{
  "video_id": "YOUR_VIDEO_ID",
  "start_date": "2026-10-19",
  "end_date": "2026-10-25"
}
```

Check that the returned payload has the video's own views and that the engagement percentage is consistent with its likes, comments and shares. For a video with no activity in the range, check that the values are zero and `reason` is `no-report-data`. Draft test runs can't confirm the row's field names until a real report has run, so compare the step's output against the YouTube result before trusting the mapping.

## Customize

- **Write each summary to Google Sheets** for archival reporting: add a Google Sheets step after the summary that appends one row.
- **Alert on thresholds:** post a Slack message to a configured channel when revenue or engagement crosses a set value.

## Notes

- The workflow returns its summary in the run output. A catch hook can't return a value to the sender, so the caller reads results from the run, or from a later step that writes them somewhere.
- Engagement percentage is a derived figure (likes, comments and shares over views). Change the formula in `workflow.ts` if your dashboard defines engagement differently.
- Never commit a real channel ID or webhook URL. Anyone with the webhook URL can request reports.
