---
name: update-product-roadmap-canvases-from-weekly-issue-list
description: Build a Zap on Zapier that runs every week, finds Jira issues labelled as roadmap items and updated in the last seven days, and prepares a roadmap canvas update for each one by project key. Use when a product team keeps its roadmap in Jira and in per-project roadmap canvases, and wants those canvases kept in step with the week's issue progress.
license: MIT
metadata:
  author: zapier
  summary: "Every week, the roadmap items your team touched in Jira are matched to their roadmap canvas, so the canvas shows current status, priority, due date and progress without anyone copying them by hand."
  apps: "Schedule by Zapier, Jira Software Cloud"
  category: "Product"
  job: "Product roadmap management"
  source: "https://zapier.com/automations/product/product-roadmap-management/roadmap-updates/update-product-roadmap-canvases-from-weekly-issue-list"
---

# Update product roadmap canvases from weekly issue list

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-product-roadmap-canvases-from-weekly-issue-list. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** Schedule by Zapier runs the workflow once a week.
2. **Jira Software Cloud** searches for issues with the roadmap label that were updated in the last seven days (up to 100).
3. For each issue, the workflow looks up its project key in a table that maps projects to roadmap canvas IDs. Issues from projects with no canvas are skipped, never sent to a fallback canvas.
4. The workflow returns each matched issue's canvas ID, key, title, status, status category, priority, due date and percent done, ready for the canvas update.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting               | What goes there                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_PROJECT_KEY` | A Jira project key whose roadmap items should update a canvas. Add one entry in `CANVAS_ID_BY_PROJECT_KEY` per project |
| `REPLACE_CANVAS_ID`   | The roadmap canvas ID for that project, paired with its key                                                            |

Also review the defaults with them: `ROADMAP_LABEL` (the Jira label that marks roadmap items; `"roadmap"`), `LOOKBACK` (how far back to search; `"-7d"`), `MAX_ITEMS` (most issues handled per run; `100`) and the schedule in `triggers/every-week.ts` (Monday at 9:00 AM UTC).

Ask which canvas app holds the roadmap canvases. The canvas update is not built yet (see Notes), so this answer decides what to connect next.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `jira-software-cloud` to the user's Jira Software Cloud connection for the Jira site that holds the roadmap issues. Schedule by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/every-week.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run the workflow with an empty input (`{}`), since a scheduled run supplies no fields. The Zap only reads from Jira, so the test writes nothing. Check:

- The Jira search returned only issues with the roadmap label, updated in the last seven days.
- `pendingCanvasUpdates` contains one entry only for issues whose project key is in `CANVAS_ID_BY_PROJECT_KEY`.
- Each entry has its canvas ID, issue key, title, status, status category, priority, due date and percent done, and those values match the issue in Jira.
- `skipped` equals the number of returned issues that had no canvas mapping.

If run-status tools aren't available, check the result in Jira directly. Any test data is the user's to delete, not the agent's. Then publish, confirm the trigger is active, and confirm it reads back as active.

## Notes

- The canvas update is not in this workflow yet. `workflow.ts` returns the matched updates as `pendingCanvasUpdates`; a step that writes each one to its canvas belongs after `find-roadmap-issues`, with one `ctx.step` per update.
- Release notes are not in the Jira search output, so the canvas notes field needs a separate custom-field read.
- The search returns at most 100 issues per run. If more are updated in a week, the rest wait for the next run.
- Jira's search output shape is taken from the action's declared schema. Check the first run's fields against it.
- Anyone with access to the Jira site can add the roadmap label. Review the mapping table before each run to keep canvases matched to the right projects.
- To narrow the window, add a pre-filter that includes only recently completed or active issues. For high-velocity projects, change the schedule to twice a week.
