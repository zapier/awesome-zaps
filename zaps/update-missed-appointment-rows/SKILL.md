---
name: update-missed-appointment-rows
description: Build a Zap on Zapier that marks an attendee as a no-show in a Google Sheets tracker when an absence notice arrives by webhook, with a timestamp and a note on where the notice came from. Use when a school, clinic or service business tracks attendance or appointments in a sheet and wants missed ones logged without manual edits.
license: MIT
metadata:
  author: zapier
  summary: "When an absence notice comes in, the attendee's row in your tracking sheet is marked as a no-show, timestamped and noted, so coordinators see it right away."
  apps: "Webhooks by Zapier, Google Sheets"
  category: "Business Owners"
  job: "Education operations"
  source: "https://zapier.com/automations/business-owners/education-operations/attendance-tracking/update-missed-appointment-rows-in-your-tracking-sheet"
---

# Update missed appointment rows

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-missed-appointment-rows. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** an absence notice arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). A check-in system, form or script posts to it.
2. **Google Sheets** looks up the row whose attendee ID matches `attendee_id` in the payload. If there is no match, the run stops and writes nothing.
3. **Google Sheets** updates that row: the status column becomes `No-show`, the last-updated column gets the time it was marked, and the comments column gets a note built from the payload's `source`, `reason` and `submitted_at`.

The Zap changes at most one row and never deletes rows.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting          | What goes there                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `SPREADSHEET_ID` | The attendance tracker: ask which sheet it is, then look up its ID (the long ID in its URL) with the user's Google Sheets connection |

Also review the defaults with them:

- `WORKSHEET_ID`: the tab holding the tracker. `"0"` is the first tab.
- `ATTENDEE_ID_COLUMN`, `STATUS_COLUMN`, `LAST_UPDATED_COLUMN`, `COMMENTS_COLUMN`: column keys such as `COL$A`, not header names. Map the user's headers to their column letters.
- `NO_SHOW_VALUE`: the status to write. `"No-show"` unless they want another status.

Before turning it on, confirm the absence notice sends the attendee's ID as `attendee_id`. The code rejects payloads without it, so if their system uses another field name, settle that before installing.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` to the user's Google Sheets connection for the account that owns the tracking sheet. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connection (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test (`run_workflow_draft` in Zapier MCP), with the attendee ID of a test row the user set up for this, not a real attendee:

```json
{
  "attendee_id": "A-102",
  "source": "front-desk check-in system",
  "reason": "Missed 10:00 appointment",
  "submitted_at": "2026-10-29T10:15:00Z"
}
```

Confirm that only that row changed: status set, a time in last-updated, and the note in comments. If run-status tools aren't available, check the result in Google Sheets directly. The user restores or deletes the test row, not the agent.

## Notes

- Once the Zap is published and its trigger is active, give the user the webhook URL to point their check-in system at. Anyone with that URL can mark attendees absent, so never commit it.
- Google Sheets may show the timestamp in the sheet's own format and time zone.
- If two rows share an attendee ID, only the first is updated.
- To notify a coordinator on the first no-show, add a Slack or email step after the update. To create a follow-up task when the row has contact details, add a step that creates one.
- Never commit a real spreadsheet ID.
