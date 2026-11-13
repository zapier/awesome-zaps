---
name: update-daily-dashboard-row-with-campaign-engagement-metrics
description: Build a Zap on Zapier that runs every evening, pulls the day's campaign engagement buckets (impressions, clicks, opens, conversions) from an analytics endpoint, cleans them into plain numbers and writes them into that day's existing row in a Google Sheets dashboard. Use when a marketing or project team keeps a one-row-per-day tracker sheet and wants it filled from their analytics API without copying numbers by hand.
license: MIT
metadata:
  author: zapier
  summary: "Every evening, today's campaign engagement numbers are pulled from your analytics endpoint, cleaned into plain numbers and written into today's row of your dashboard sheet."
  apps: "Schedule by Zapier, Webhooks by Zapier, Google Sheets"
  category: "Data & Analytics"
  job: "Data visualization"
  source: "https://zapier.com/automations/data-analytics/data-visualization/visual-dashboard-updates/update-daily-dashboard-row-with-campaign-engagement-metrics"
---

# Update daily dashboard row with campaign engagement metrics

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-daily-dashboard-row-with-campaign-engagement-metrics. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** `schedule` runs every day at 7:00 PM in the Zap's time zone.
2. **Date range (code):** works out the run's local date (`YYYY-MM-DD`) and that day's start and end as UTC timestamps.
3. **`webhook`** sends a GET to the analytics endpoint with `start` and `end` (plus any extra params) and reads the bucket object at the metrics path in the JSON response.
4. **Normalize (code):** each bucket named in the metric map becomes a plain integer or decimal (`"1,234"` → `1234`, `"37.50"` → `37.5`). Non-numeric or missing buckets are skipped and listed in the run's `missing` output; if none are numeric the run fails.
5. **`google-sheets`** looks up the row whose date column equals the run's date.
6. **`google-sheets`** updates that row's metric columns. Columns not in the metric map are left alone.

The Zap never creates a row. A day with no matching row fails on purpose, so the gap shows in run history.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | What goes there                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------- |
| `REPLACE_ANALYTICS_URL`  | The analytics endpoint that returns the day's buckets. It must answer a GET with JSON. |
| `REPLACE_SPREADSHEET_ID` | The dashboard spreadsheet, found with the user's Google Sheets connection              |

Also review the defaults with them: `TIMEZONE` (`America/New_York`, the zone that defines "the day"; the trigger's `timezone_override` must match it), `ANALYTICS_EXTRA_PARAMS` (`{}`; fixed query params such as a campaign ID or API key), `ANALYTICS_METRICS_PATH` (`""`; a dot path such as `data.totals` when the buckets are nested), `WORKSHEET_ID` (`"0"`, the first tab), `DATE_COLUMN` (`COL$A`), and `METRIC_COLUMNS` in `workflow.ts`, which maps each bucket name to a column (`impressions` → `COL$B`, `clicks` → `COL$C`, `opens` → `COL$D`, `conversions` → `COL$E`). Map the user's headers to their column letters.

Before turning it on, confirm:

- If the endpoint needs a header-based API key, the GET step's `headers` input has to be added. Tell the user before installing.
- The code looks up dates as `YYYY-MM-DD`. If the sheet shows dates another way, change the format in `dayWindow` before installing.
- Which time zone defines "the day", and whether 7 PM is the right time.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` to the user's Google Sheets connection, for the account that owns the dashboard sheet. Schedule by Zapier and Webhooks by Zapier need no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/every-day.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Make sure the sheet has a row for today's date (in `TIMEZONE`). Run a draft test (`run_workflow_draft`) with this input:

```json
{}
```

Point the endpoint at an echo service for this run: `ANALYTICS_URL` = `https://httpbin.org/anything`, `ANALYTICS_METRICS_PATH` = `args`, and `ANALYTICS_EXTRA_PARAMS` = `{ "impressions": "12500", "clicks": "1,234", "opens": "860.0", "conversions": "37.50" }`. httpbin echoes the query back, so those become the buckets.

Check that only today's row changed and holds `12500`, `1234`, `860` and `37.5`, and that the run's `missing` list is empty. Then set the constants back to the real endpoint, publish, and confirm the trigger is active.

If run-status tools aren't available, check the result in Google Sheets directly. The user deletes the test values from today's row, not the agent.

## Notes

- To create today's row when it is missing, add a `google-sheets` `add_row` step with the date and the metrics.
- To post a team summary on big changes, compare the new totals with the row's previous values and post to a team channel past a threshold.
- The GET step journals the endpoint's whole response, so keep that response small.
- If two rows share a date, only the first is updated.
- Never commit a real spreadsheet ID, endpoint URL or API key.
