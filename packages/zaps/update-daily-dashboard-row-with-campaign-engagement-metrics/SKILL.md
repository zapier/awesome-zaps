---
name: update-daily-dashboard-row-with-campaign-engagement-metrics
description: Build a Zapier Next Gen Zap that runs every evening, pulls the day's campaign engagement buckets (impressions, clicks, opens, conversions) from an analytics endpoint, cleans them into plain numbers and writes them into that day's existing row in a Google Sheets dashboard. Use when a marketing or project team keeps a one-row-per-day tracker sheet and wants it filled from their analytics API without copying numbers by hand.
metadata:
  author: zapier
  summary: "Every evening, today's campaign engagement numbers are pulled from your analytics endpoint, cleaned into plain numbers and written into today's row of your dashboard sheet."
  apps: "Schedule by Zapier, Webhooks by Zapier, Google Sheets"
  category: "Data & Analytics"
  job: "Data visualization"
  source: "https://zapier.com/automations/data-analytics/data-visualization/visual-dashboard-updates/update-daily-dashboard-row-with-campaign-engagement-metrics"
---

# Update daily dashboard row with campaign engagement metrics

## What it does

1. **Trigger:** Schedule by Zapier, every day at 7:00 PM in `TIMEZONE`.
2. **Date range (code):** works out the run's local date (`YYYY-MM-DD`) and that day's start and end as UTC timestamps.
3. **Webhooks by Zapier** sends a GET to `ANALYTICS_URL` with `start` and `end` (plus any `ANALYTICS_EXTRA_PARAMS`) as query parameters and reads the bucket object at `ANALYTICS_METRICS_PATH` in the JSON response.
4. **Normalize (code):** each bucket named in `METRIC_COLUMNS` becomes a plain integer or decimal (`"1,234"` → `1234`, `"37.50"` → `37.5`). Non-numeric or missing buckets are skipped and listed in the run's `missing` output; if none are numeric the run fails.
5. **Google Sheets** looks up the row whose date column equals the run's date. If there is none, the run fails (the spec updates existing rows only).
6. **Google Sheets** updates that row's metric columns. Columns not in `METRIC_COLUMNS` are left alone.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Schedule by Zapier, Every Day (`schedule`, `everyDay`) with params `{ "hod": "7:00 PM", "weekends": "yes", "timezone_override": "<TIMEZONE>" }`. It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the user's Google Sheets connection, for the account that owns the dashboard sheet.
   - Webhooks by Zapier needs no connection.
3. **Constants:**
   - `TIMEZONE`: IANA zone that defines "the day"; use the same value as the trigger's `timezone_override`.
   - `ANALYTICS_URL`: the analytics endpoint. It must answer a GET with JSON.
   - `ANALYTICS_EXTRA_PARAMS`: fixed query params such as a campaign ID or API key. Leave `{}` if none.
   - `ANALYTICS_METRICS_PATH`: dot path to the bucket object in the response, e.g. `"data.totals"`; `""` if the buckets are top-level keys.
   - `SPREADSHEET_ID`, `WORKSHEET_ID`: the dashboard sheet and tab (first tab is `"0"`).
   - `DATE_COLUMN`: the column holding the row date, as a column key such as `COL$A`.
   - `METRIC_COLUMNS`: bucket name in the response → column key (`COL$B`, …). Map the user's headers to column letters.
4. Test with the steps below, then publish, wait until the trigger is active, and confirm it is enabled.

## Ask the user

- What is the analytics endpoint URL, what extra query params does it need, and where in its JSON response do the buckets sit? If it needs a header-based API key, the GET action's `headers` input has to be added; tell them before installing.
- Which sheet and tab is the dashboard, which column holds the date, and which column gets each bucket?
- How are dates written in that column? The code looks up `YYYY-MM-DD`. If the sheet shows dates another way, change the format in `dayWindow` before installing.
- Which time zone defines "the day", and is 7 PM the right time?

## Test

Make sure the sheet has a row for today's date (in `TIMEZONE`), then run a draft test run (`run_workflow_draft` in Zapier MCP) with an empty input:

```json
{}
```

To test without a real endpoint, the build used `ANALYTICS_URL = "https://httpbin.org/anything"`, `ANALYTICS_METRICS_PATH = "args"` and `ANALYTICS_EXTRA_PARAMS = { "impressions": "12500", "clicks": "1,234", "opens": "860.0", "conversions": "37.50" }`; httpbin echoes the query back, so those become the buckets. Check that only today's row changed and holds `12500`, `1234`, `860`, `37.5`, and that the run's `missing` list is empty. Then set the constants back to the real endpoint.

## Customize

- **Create the row when it's missing:** instead of failing when no row matches today's date, add a Google Sheets `add_row` step with the date and the metrics.
- **Post a team summary on big changes:** compare the new totals with the row's previous values and post a short summary to a team channel when the change passes a configured threshold.

## Notes

- Runs on a day with no matching row fail on purpose, so a missing row is visible in run history rather than silently skipped.
- The date window is computed inside a step because the durable runtime does not allow `new Date()` outside one.
- The GET step journals the endpoint's whole response. Keep the endpoint's response small.
- If two rows share a date, only the first is updated.
- Never commit a real spreadsheet ID, endpoint URL or API key.
