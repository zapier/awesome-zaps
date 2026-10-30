---
name: update-product-roadmap-canvases-from-weekly-issue-list
description: Build a Zapier Next Gen Zap that runs every week, finds Jira issues labelled as roadmap items and updated in the last seven days, and prepares a roadmap canvas update for each one by project key. Use when a product team keeps its roadmap in Jira and in per-project roadmap canvases, and wants those canvases kept in step with the week's issue progress.
metadata:
  author: zapier
  summary: "Every week, the roadmap items your team touched in Jira are matched to their roadmap canvas, so the canvas shows current status, priority, due date and progress without anyone copying them by hand."
  apps: "Schedule by Zapier, Jira Software Cloud"
  category: "Product"
  job: "Product roadmap management"
  source: "https://zapier.com/automations/product/product-roadmap-management/roadmap-updates/update-product-roadmap-canvases-from-weekly-issue-list"
---

# Update product roadmap canvases from weekly issue list

## What it does

1. **Trigger:** Schedule by Zapier runs the workflow once a week.
2. **Jira Software Cloud** searches for issues with the roadmap label that were updated in the last seven days (up to 100).
3. For each issue, the workflow looks up its project key in a table that maps projects to roadmap canvas IDs. Issues from projects with no canvas are skipped.
4. The workflow returns each matched issue's canvas ID, key, title, status, status category, priority, due date and percent done, ready for the canvas update.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Schedule by Zapier, Every Week (`schedule`, `everyWeek`). It needs no connection, so its `authentication_id` is `null`. Set the day and time you want; the code does not depend on them.
2. **Connections** (each alias in the code is the app's slug):
   - `jira-software-cloud`: the user's Jira Software Cloud connection, for the Jira site that holds the roadmap issues.
3. **Constants:**
   - `ROADMAP_LABEL`: the Jira label that marks roadmap items. Defaults to `"roadmap"`.
   - `LOOKBACK`: how far back to search, as a JQL relative date. Defaults to `"-7d"`.
   - `MAX_ITEMS`: the most issues handled per run. Defaults to `100`.
   - `CANVAS_ID_BY_PROJECT_KEY`: one entry per Jira project key, mapped to that project's roadmap canvas ID. Replace the `PROJ` and `YOUR_CANVAS_ID` placeholders.
4. Test with the steps below, then publish, wait until the trigger is active, and confirm it reads back as active.

## Ask the user

- Which Jira label marks roadmap items? (The default is `roadmap`.)
- Which Jira project keys map to which roadmap canvases, and what is each canvas ID?
- Which canvas app holds the roadmap canvases? The update step is not built yet (see Notes), so this answer decides what to connect next.
- What day and time should the weekly run start? The schedule defaults to Monday at 9:00 AM UTC.

## Test

Run the workflow with an empty input (`{}`), as a Schedule run would supply no fields, and check:

- The Jira search returned only issues with the roadmap label, updated in the last seven days.
- `pendingCanvasUpdates` contains one entry only for issues whose project key is in `CANVAS_ID_BY_PROJECT_KEY`.
- Each entry has its canvas ID, issue key, title, status, status category, priority, due date and percent done, and those values match the issue in Jira.
- `skipped` equals the number of returned issues that had no canvas mapping.

## Customize

- **Narrow the window:** add a pre-filter to include only recently completed or active issues.
- **Change the schedule to twice a week** for high-velocity projects.

## Notes

- The canvas update is not in this workflow yet. `workflow.ts` returns the matched updates as `pendingCanvasUpdates`; a step that writes each one to its canvas belongs after `find-roadmap-issues`, with one `ctx.step` per update.
- Release notes are not in the Jira search output, so the canvas notes field needs a separate custom-field read.
- Issues from projects with no canvas are skipped, not sent to a fallback canvas.
- The search returns at most 100 issues per run. If more are updated in a week, the rest wait for the next run.
- Jira's search output shape is taken from the action's declared schema. Check the first run's fields against it.
- Anyone with access to the Jira site can add the roadmap label. Review the mapping table before each run to keep canvases matched to the right projects.
