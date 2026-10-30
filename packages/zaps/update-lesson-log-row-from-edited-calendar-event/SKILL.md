---
name: update-lesson-log-row-from-edited-calendar-event
description: Build a Zapier Next Gen Zap that keeps a lesson log in Google Sheets in step with Google Calendar. When a lesson event is created or edited, its row is updated (date, duration, title, notes), or a new row is added when no row has that event ID. Use when a tutoring, music or education business tracks sessions in a sheet and wants session details and billing to follow the calendar without manual edits.
metadata:
  author: zapier
  summary: "When a lesson on your calendar is edited, its row in your lesson log is updated to match, so session details and billing stay accurate."
  apps: "Google Calendar, Google Sheets"
  category: "Business Owners"
  job: "Education operations"
  source: "https://zapier.com/automations/business-owners/education-operations/attendance-tracking/update-lesson-log-row-from-edited-calendar-event"
---

# Update lesson log row from edited calendar event

## What it does

1. **Trigger:** a lesson event is created or updated on the chosen Google Calendar (cancelled events are skipped by the trigger).
2. **Google Sheets** looks for the row whose event ID (column A) matches the event's `id`.
3. If a row matches, **Google Sheets** updates it: session date (the event's start date), duration in minutes, session summary (the event title) and session notes (the event description). The Amount column is left alone, so its formula recalculates from the new duration.
4. If no row matches, **Google Sheets** adds one with the same fields and the event ID.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at its top, and the trigger calendar described below.

1. **Trigger:** Google Calendar, New or Updated Event (`google-calendar` / `event_updated`), with `calendarid` set to the calendar that holds the lessons, and `expand_recurring` left on. Authenticate it with the user's Google Calendar connection.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the user's Google Sheets connection, for the account that owns the lesson log.
3. **Constants:**
   - `SPREADSHEET_ID`: the long ID in the sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `EVENT_ID_COLUMN`, `DATE_COLUMN`, `DURATION_COLUMN`, `SUMMARY_COLUMN`, `NOTES_COLUMN`: column keys such as `COL$A`, not header names. Map the user's headers to their column letters. Column A must hold the event ID.
4. Test with the steps below, then publish, wait until the trigger is active, and leave the workflow on.

## Ask the user

- Which Google Calendar holds the lessons? This goes in the trigger's `calendarid`.
- Which sheet and tab is the lesson log, and which columns hold the event ID, date, duration, summary, notes and billing amount?
- Does the sheet already have a billing formula in the amount column? The workflow relies on it. Rows the workflow adds will not have it until it is copied down (see Notes).

## Test

Run these two sample inputs as draft test runs (`run_workflow_draft` in Zapier MCP) against a test spreadsheet and a test calendar event you create for this. Each sample is the trigger payload shape: `id`, `summary`, `description`, `start.dateTime` and `duration_minutes`.

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

Then tell the user to delete the test rows and events if they were real data.

## Customize

- **Only some events:** add a filter step so only events on a set calendar, or with a tag, continue.
- **Billing alerts:** send an internal notification to program coordinators when the billing amount changes by more than a threshold.

## Notes

- The session date is the date part of the event's start, in the event's own timezone.
- If two rows share an event ID, only the first is updated.
- The workflow does not write the billing formula. The sheet's formula recalculates when the duration changes. A row the workflow adds has no Amount until the formula is copied down. Adding the formula to the sheet's amount column for every row fixes this without changing the workflow.
- Never commit a real spreadsheet ID.
