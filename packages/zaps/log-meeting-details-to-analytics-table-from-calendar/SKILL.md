---
name: log-meeting-details-to-analytics-table-from-calendar
description: Build a Zapier Next Gen Zap that logs each new or updated Google Calendar event as a normalized row in a Zapier Table, with start, end, duration and attendees, skipping events already logged. Use when a team wants meeting data in an analytics table for dashboards or follow-up without copying it by hand.
metadata:
  author: zapier
  summary: "Each new or updated calendar event becomes one tidy row in your analytics table, with start, end, length and attendees, so dashboards and follow-ups have consistent meeting data."
  apps: "Google Calendar, Zapier Tables"
  category: "Data & Analytics"
  job: "Data automation"
  source: "https://zapier.com/automations/data-analytics/data-automation/automated-data-collection/log-meeting-details-to-analytics-table-from-calendar"
---

# Log meeting details to analytics table from calendar

## What it does

1. **Trigger:** a Google Calendar event is created or updated on the watched calendar (Google Calendar, New or Updated Event). Cancelled events do not fire it.
2. **Normalize (in code):** start and end are passed through as the ISO 8601 timestamps the trigger sends. Duration is worked out in minutes from them. Attendee emails are joined into one comma-separated string.
3. **Zapier Tables, Find Records:** looks for a row whose Source ID is the event ID. If one exists, the run stops and writes nothing.
4. **Zapier Tables, Create Record:** adds one row with title, start, end, duration, attendees and the event ID as Source ID.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top; everything else stays as written.

1. **Trigger:** Google Calendar, New or Updated Event (`google-calendar` / `event_updated`), with `calendarid` set to the calendar to watch and `expand_recurring` set to `true`. Its `authentication_id` is the Google Calendar connection's ID.
2. **Connections** (each alias in the code is the app's slug):
   - `zapier-tables`: the Zapier Tables connection for the account that owns the analytics table.
   - The trigger's Google Calendar connection is set on the trigger (`authentication_id`), not in the code.
3. **Constants** (top of `workflow.ts`):
   - `CALENDAR_ID`: the calendar to watch. Set the trigger's `calendarid` to the same value.
   - `TABLE_ID`: the table's ID, from its URL.
   - `SOURCE_ID_FIELD`: the key of the column that holds the Google Calendar event ID. The reference table used `f6`, which is the sixth column.
   - The other column keys are the `new__data__f1` to `new__data__f6` inputs in the create step. They follow the table's column order: Title, Start, End, Duration (minutes), Attendees, Source ID. Map them to the user's columns if their table is laid out differently.

## Ask the user

- Which calendar should be watched? For a team, this is usually a shared calendar, not one person's.
- Which Zapier Tables table is the analytics table, and which of its columns hold the event ID, title, start, end, duration and attendees?
- Should a row be skipped when its event ID is already in the table? The default is yes. Changing that means building the Customize item below.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, with a table ID and field keys that exist in the user's table:

```json
{
  "id": "0inqqln6nqufe2uvjpp1ugdb54",
  "summary": "[install-test] Log meeting details to analytics table",
  "start": {
    "dateTime": "2026-10-30T11:00:00-04:00",
    "timeZone": "America/New_York"
  },
  "end": {
    "dateTime": "2026-10-30T11:45:00-04:00",
    "timeZone": "America/New_York"
  },
  "attendee_emails": "you@example.com"
}
```

Check that: the run completes; one new row appears with the title, start `2026-10-30T11:00:00-04:00`, end `2026-10-30T11:45:00-04:00`, duration `45` and the attendee email; and a second run with the same input adds no row. Then tell the user to delete the test row if it was real data.

On the install check, the first run returned a row (`01M6511FACHSH1HH83HKPTXM19`) with those values, and the second run returned `skipped: true` with `reason: "event-already-logged"`.

## Customize

- **Update instead of create:** when the event ID already exists, update that row rather than skipping it.
- **Only qualifying events:** log only events from a chosen calendar or matching criteria, using a conditional step.

## Notes

- The trigger is "New or Updated Event", which also fires for newly created events. The spec's "Event updated" is the closest match.
- Times are passed through in the calendar's own offset (for example `-04:00`), not converted to UTC. The table stores the text as given.
- The attendee field lists email addresses from the event, comma-separated, and does not list response status.
- Never commit a real table ID or calendar ID. Anyone who can edit the Zap can read where the data goes.
