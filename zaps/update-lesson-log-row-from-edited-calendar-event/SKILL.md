---
name: update-lesson-log-row-from-edited-calendar-event
description: Build a Zap on Zapier that keeps a lesson log in Google Sheets in step with Google Calendar. When a lesson event is created or edited, its row is updated (date, duration, title, notes), or a new row is added when no row has that event ID. Use when a tutoring, music or education business tracks sessions in a sheet and wants session details and billing to follow the calendar without manual edits.
license: MIT
metadata:
  author: zapier
  summary: "When a lesson on your calendar is edited, its row in your lesson log is updated to match, so session details and billing stay accurate."
  apps: "Google Calendar, Google Sheets"
  category: "Business Owners"
  job: "Education operations"
  source: "https://zapier.com/automations/business-owners/education-operations/attendance-tracking/update-lesson-log-row-from-edited-calendar-event"
---

# Update lesson log row from edited calendar event

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-lesson-log-row-from-edited-calendar-event. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a lesson event is created or updated on the chosen Google Calendar (`google-calendar`, `event_updated`). Cancelled events are skipped by the trigger.
2. **Google Sheets** looks for the row whose event ID (column A) matches the event's `id`.
3. If a row matches, **Google Sheets** updates it: session date (the event's start date), duration in minutes, session summary (the event title) and session notes (the event description). The Amount column is left alone, so its formula recalculates from the new duration.
4. If no row matches, **Google Sheets** adds one with the same fields and the event ID.

The Zap never deletes a row.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | What goes there                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------- |
| `REPLACE_SPREADSHEET_ID` | The lesson-log spreadsheet. Find it by name with the user's Google Sheets connection. |

Also review the defaults with them: `WORKSHEET_ID` (`"0"` is the first tab) and the column letters in `config.ts`, from `EVENT_ID_COLUMN` to `NOTES_COLUMN`. Column A must hold the event ID. Map the user's headers to their column letters.

Ask these before turning it on:

- Which Google Calendar holds the lessons? This is not a `REPLACE_` value: it is set as `calendarid` on the trigger when you build it.
- Does the sheet already have a billing formula in the amount column? The Zap relies on it. Rows it adds will not have it until it is copied down (see Notes).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` (the account that owns the lesson log) to the user's Google Sheets connection. The trigger's `google-calendar` account is bound in step 2. No other apps need a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/event-updated.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. Set the trigger's `calendarid` to the calendar that holds the lessons, and leave `expand_recurring` on. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run these two sample inputs as draft test runs (`run_workflow_draft` in Zapier MCP) against a test spreadsheet and a test calendar event the user creates for this. Each sample is the trigger payload shape: `id`, `summary`, `description`, `start.dateTime` and `duration_minutes`.

Update path: a row already exists with the event's ID.

```json
{
  "id": "67isrck0civk6i0gauq4ehe544",
  "summary": "[install-test] Lesson 1 - piano (edited)",
  "description": "[install-test] edited notes",
  "start": {
    "dateTime": "2026-11-02T10:00:00-05:00",
    "timeZone": "America/New_York"
  },
  "end": {
    "dateTime": "2026-11-02T10:45:00-05:00",
    "timeZone": "America/New_York"
  },
  "duration_minutes": 45
}
```

Check that only that event's row changed: date `2026-11-02`, duration `45`, the new summary and notes, and the amount recalculated from the sheet's formula (30 for this sample, from a formula of `C/60*40`).

Add path: no row has the event's ID.

```json
{
  "id": "mkbqu11emh2cvbirq6kblekfbk",
  "summary": "[install-test] Lesson 2 - piano (new)",
  "description": "[install-test] new event notes",
  "start": {
    "dateTime": "2026-11-03T14:00:00-05:00",
    "timeZone": "America/New_York"
  },
  "end": {
    "dateTime": "2026-11-03T14:30:00-05:00",
    "timeZone": "America/New_York"
  },
  "duration_minutes": 30
}
```

Check that a new row appears at the bottom with the event ID, date `2026-11-03`, duration `30`, the summary and the notes. Its amount cell stays blank.

If run-status tools aren't available, check the result in Google Sheets directly. Ask the user to delete the test rows and events; the agent does not delete them. Then publish, confirm the trigger is active, and leave the Zap on.

## Notes

- The session date is the date part of the event's start, in the event's own timezone.
- If two rows share an event ID, only the first is updated.
- The Zap does not write the billing formula. A row it adds has no Amount until the formula is copied down. Adding the formula to the amount column for every row fixes this without changing the Zap.
- To customize: add a filter so only events on a set calendar, or with a tag, continue; or send an internal alert to program coordinators when the billing amount changes by more than a threshold.
- Never commit a real spreadsheet ID.
