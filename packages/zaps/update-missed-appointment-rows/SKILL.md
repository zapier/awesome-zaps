---
name: update-missed-appointment-rows
description: Build a Zapier Next Gen Zap that marks an attendee as a no-show in a Google Sheets tracker when an absence notice arrives by webhook, with a timestamp and a note on where the notice came from. Use when a school, clinic or service business tracks attendance or appointments in a sheet and wants missed ones logged without manual edits.
metadata:
  author: zapier
  summary: "When an absence notice comes in, the attendee's row in your tracking sheet is marked as a no-show, timestamped and noted, so coordinators see it right away."
  apps: "Webhooks by Zapier, Google Sheets"
  category: "Business Owners"
  job: "Education operations"
  source: "https://zapier.com/automations/business-owners/education-operations/attendance-tracking/update-missed-appointment-rows-in-your-tracking-sheet"
---

# Update missed appointment rows

## What it does

1. **Trigger:** an absence notice arrives at a Webhooks by Zapier catch hook (a check-in system, form or script posts to it).
2. **Google Sheets** looks up the row whose attendee ID matches `attendee_id` in the payload. If there is no match, the run stops and writes nothing.
3. **Google Sheets** updates that row: the status column becomes `No-show`, the last-updated column gets the time it was marked, and the comments column gets a note built from the payload's `source`, `reason` and `submitted_at`.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the user's Google Sheets connection, for the account that owns the tracking sheet.
3. **Constants:**
   - `SPREADSHEET_ID`: the long ID in the sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `ATTENDEE_ID_COLUMN`, `STATUS_COLUMN`, `LAST_UPDATED_COLUMN`, `COMMENTS_COLUMN`: column keys such as `COL$A`, not header names. Map the user's headers to their column letters.
   - `NO_SHOW_VALUE`: the status to write. Defaults to `"No-show"`.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point their check-in system at.

## Ask the user

- Which sheet and tab is the tracker, and which columns hold the attendee ID, status, last-updated time and comments?
- What does their absence notice send as the attendee's ID? The payload must carry it as `attendee_id`. If their system uses another field name, tell them before installing; the code rejects payloads without `attendee_id`.
- Should the status read something other than `No-show`?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, with an attendee ID that exists in the user's sheet:

```json
{
  "attendee_id": "A-102",
  "source": "front-desk check-in system",
  "reason": "Missed 10:00 appointment",
  "submitted_at": "2026-10-29T10:15:00Z"
}
```

Confirm that only that attendee's row changed: status set, a time in last-updated, and the note in comments. Then tell the user to change the row back if it was real data.

## Customize

- **Notify a coordinator** on the first no-show: add a Slack or email step after the update.
- **Follow-up task:** create a task when the row has contact details.

## Notes

- Google Sheets may show the timestamp in the sheet's own format and time zone.
- If two rows share an attendee ID, only the first is updated.
- Never commit a real spreadsheet ID or webhook URL. Anyone with the webhook URL can mark attendees absent.
