---
name: delete-meeting-recordings-after-30-day-retention-for-ops
description: Build a Zapier Next Gen Zap that deletes a Zoom meeting's cloud recordings 30 days after a new cloud recording completes, to enforce a retention policy. Use when a team must remove meeting recordings after a fixed retention period to cut storage costs and keep archives audit-ready.
metadata:
  author: zapier
  summary: "Cloud recordings are automatically deleted 30 days after they finish, so retention rules are enforced without anyone remembering to clean up."
  apps: "Zoom"
  category: "Data & Analytics"
  job: "Data compliance security"
  source: "https://zapier.com/automations/data-analytics/data-compliance-security/data-retention-management/delete-meeting-recordings-after-30-day-retention-for-ops"
---

# Delete meeting recordings after 30-day retention

## What it does

1. **Trigger:** Zoom, New Cloud Recording. Fires when a cloud recording finishes for a meeting or webinar.
2. **Wait:** the workflow pauses for `RETENTION_DAYS` (30) days.
3. **Check:** a Zoom API GET lists the meeting's recordings. If none remain, the run stops and deletes nothing.
4. **Delete:** Zoom's Delete Meeting Recordings removes the meeting's recordings, using `DELETION_TYPE` (`permanent`).

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Zoom, New Cloud Recording (`zoom` / `new_recording`). Needs the Zoom connection, so `authentication_id` is that connection's ID.
2. **Connections** (each alias in the code is the app's slug):
   - `zoom`: the user's Zoom connection. Zoom allows one connection per user, so use the account that owns the recordings.
3. **Constants:**
   - `RETENTION_DAYS`: days to keep a recording. Defaults to `30`.
   - `DELETION_TYPE`: `"permanent"` or `"trash"`. `"trash"` moves the recordings to Zoom's trash, where they stay about 30 more days.

## Ask the user

- Which Zoom account holds the recordings to delete? Zoom allows one connection per user, so reconnect that account before installing.
- Should deletion be permanent or move recordings to Zoom's trash first?
- Does the retention period stay at 30 days?

## Test

The planned test was a draft test run with a sample trigger payload and a non-existent meeting ID, which would exercise the skip path without deleting anything. It could not start because the account's Zoom connection was unusable. The sample payload to use:

```json
{
  "id": 85746065432,
  "topic": "[install-test] retention check",
  "uuid": "install-test-uuid"
}
```

Before publishing, confirm with a draft run that (a) the check step returns no recording files for the fake ID and the run ends `skipped`, and (b) no delete call is made. Wait time means a draft run would sit for 30 days unless `RETENTION_DAYS` is temporarily set to `0` in the test copy only. Do not run the delete step against a real recording without the user's say-so.

## Customize

- **Shorten or extend the delay per campaign** (7, 30 or 90 days): change `RETENTION_DAYS`, or build one workflow per period.
- **Archive before delete:** add a step that copies the recordings to archive storage before the delete step. Not built.

## Notes

- Zoom has no action that deletes one recording. Delete Meeting Recordings removes every recording for the meeting, so this workflow does the same.
- The trigger is Zoom's New Cloud Recording, so only cloud recordings start the workflow. Local recordings are never targeted.
