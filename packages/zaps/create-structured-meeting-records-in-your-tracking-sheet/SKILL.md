---
name: create-structured-meeting-records-in-your-tracking-sheet
description: Build a Zapier Next Gen Zap that appends a normalized meeting record to a Google Sheets tracker each time a Google Calendar event is created or updated. Use when a team keeps a central sheet of meetings for reporting and wants every event captured in a consistent row without manual entry.
metadata:
  author: zapier
  summary: "Every time a calendar event is created or updated, a clean row with its title, organizer, start time and attendees goes into your tracking sheet."
  apps: "Google Calendar, Google Sheets"
  category: "Personal Productivity"
  job: "Spreadsheet automation"
  source: "https://zapier.com/automations/personal-productivity/spreadsheet-automation/google-sheets-automation/create-structured-meeting-records-in-your-tracking-sheet"
---

# Create structured meeting records in your tracking sheet

## What it does

1. **Trigger:** a Google Calendar event is created or updated (`New or Updated Event`) on the calendar you choose.
2. **Normalize:** the workflow keeps the event ID, title, organizer email, start time (with the calendar's own UTC offset) and attendee emails as one comma-separated string. It also keeps the created and updated timestamps from the event. Events without an ID are skipped.
3. **Google Sheets** appends one new row to the worksheet you choose, with each field in its column. Every update adds a new row, so the sheet keeps a history; match rows on the event ID when you report.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Calendar, New or Updated Event (`google-calendar`, action `event_updated`). Set `calendarid` to the calendar to watch and leave `expand_recurring` on, so each instance of a recurring event is recorded.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the user's Google Sheets connection, for the account that owns the tracking sheet.
   - The trigger uses the user's Google Calendar connection, chosen when the trigger is set up.
3. **Constants:**
   - `CALENDAR_ID`: the calendar the trigger watches. Set the same value in the trigger's Calendar setting; the code does not read it.
   - `SPREADSHEET_ID`: the long ID in the sheet's URL.
   - `WORKSHEET_ID`: the audit tab. Use a dedicated tab; the first tab is `"0"`.
   - `EVENT_ID_COLUMN`, `TITLE_COLUMN`, `ORGANIZER_COLUMN`, `START_COLUMN`, `ATTENDEES_COLUMN`, `CREATED_COLUMN`, `UPDATED_COLUMN`: column keys such as `COL$A`, not header names. Map the user's headers to their column letters.
4. Publish, wait until the trigger is active, and give the user their workflow's editor link. Calendar events arrive from Google, so nothing else needs a webhook.

## Ask the user

- Which calendar should the trigger watch?
- Which sheet and tab hold the tracker? Should the tab be dedicated to these records?
- Which columns hold the event ID, title, organizer, start time, attendees, created time and updated time?

## Test

Run this sample as a draft test run before publishing, with a calendar you own and a worksheet you can safely write to:

```json
{
  "id": "example-event-001",
  "summary": "Weekly sync",
  "organizer__email": "you@example.com",
  "start__dateTime": "2026-11-02T10:00:00-05:00",
  "attendee_emails": "ana@example.com, ben@example.com",
  "created": "2026-10-29T09:00:00Z",
  "updated": "2026-10-29T09:30:00Z"
}
```

Confirm that one new row appears with each field in its column, the start time keeps its offset, and the attendees sit in one cell. Then delete the test row if it was real data.

## Customize

- **Record only some events:** add a filter so only events with attendees, or with a chosen visibility, are written.
- **Flag missing organizers:** add a Slack or email step for events with no organizer email.

## Notes

- Google Sheets may show the start time in the sheet's own format and time zone, depending on the column's formatting.
- The trigger's field names (such as `start__dateTime` and `organizer__email`) come from the Google Calendar trigger's output. If they differ in your account, update the names in `InputSchema` and `record`.
- Never commit a real calendar ID, spreadsheet ID or worksheet ID.
