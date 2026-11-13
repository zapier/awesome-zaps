---
name: delete-meeting-recordings-after-30-day-retention-for-ops
description: Build a Zap on Zapier that deletes a Zoom meeting's cloud recordings 30 days after a new cloud recording completes, to enforce a retention policy. Use when a team must remove meeting recordings after a fixed retention period to cut storage costs and keep archives audit-ready.
license: MIT
metadata:
  author: zapier
  summary: "Cloud recordings are automatically deleted 30 days after they finish, so retention rules are enforced without anyone remembering to clean up."
  apps: "Zoom"
  category: "Data & Analytics"
  job: "Data compliance security"
  source: "https://zapier.com/automations/data-analytics/data-compliance-security/data-retention-management/delete-meeting-recordings-after-30-day-retention-for-ops"
---

# Delete meeting recordings after 30-day retention

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/delete-meeting-recordings-after-30-day-retention-for-ops. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a cloud recording finishes for a meeting or webinar (`zoom`, `new_recording`).
2. **Wait:** the Zap pauses for `RETENTION_DAYS` (30) days.
3. **Check:** a Zoom API GET lists the meeting's recordings. If none remain, the run stops and deletes nothing.
4. **Delete:** Zoom's delete meeting recordings removes the meeting's recordings, using `DELETION_TYPE` (`permanent`).

Nothing is deleted before the retention period ends.

## Ask the user

Each `REPLACE_…` value is set per person. This zap has none, so the questions are about its account and its defaults.

- Which Zoom account holds the recordings to delete? Zoom allows one connection per user, so have that account connected before installing.

Review the defaults with them:

- `DELETION_TYPE` in `config.ts`: `"permanent"` removes the recordings; `"trash"` moves them to Zoom's trash first, where they stay about 30 more days.
- `RETENTION_DAYS` in `workflow.ts`: 30 days. Keep it or change it.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `zoom` to the user's Zoom connection for the account that owns the recordings. The trigger and the action use the same one. No other app needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`. This zap has no `REPLACE_…` values, so both go up as written. `triggers/new-recording.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with the sample trigger payload below, which names a meeting ID that doesn't exist. The Zap waits `RETENTION_DAYS` before it checks, so set it to `0` in the test copy only.

```json
{
  "id": 85746065432,
  "topic": "[install-test] retention check",
  "uuid": "install-test-uuid"
}
```

Check that the run ends `skipped`: the check step returns no recording files for the fake ID, and no delete call is made. Before publishing, confirm both. Do not run the delete step against a real recording without the user's say-so.

If run-status tools aren't available, check the result in Zoom directly. The user deletes any test data, not the agent. Publish only after the test passes, and confirm the trigger is active.

## Notes

- Zoom has no action that deletes one recording. Delete meeting recordings removes every recording for the meeting, so this Zap does the same.
- Only cloud recordings start the Zap (`new_recording`). Local recordings are never targeted.
- To shorten or extend the delay, change `RETENTION_DAYS`, or build one Zap per period.
- To archive first, add a step before the delete that copies the recordings to archive storage. Not built.
