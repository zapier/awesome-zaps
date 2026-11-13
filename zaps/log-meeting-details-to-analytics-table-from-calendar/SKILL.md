---
name: log-meeting-details-to-analytics-table-from-calendar
description: Build a Zap on Zapier that logs each new or updated Google Calendar event as a normalized row in a Zapier Table, with start, end, duration and attendees, skipping events already logged. Use when a team wants meeting data in an analytics table for dashboards or follow-up without copying it by hand.
license: MIT
metadata:
  author: zapier
  summary: "Each new or updated calendar event becomes one tidy row in your analytics table, with start, end, length and attendees, so dashboards and follow-ups have consistent meeting data."
  apps: "Google Calendar, Zapier Tables"
  category: "Data & Analytics"
  job: "Data automation"
  source: "https://zapier.com/automations/data-analytics/data-automation/automated-data-collection/log-meeting-details-to-analytics-table-from-calendar"
---

# Log meeting details to analytics table from calendar

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/log-meeting-details-to-analytics-table-from-calendar. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Google Calendar event is created or updated on the watched calendar (`google-calendar`, `event_updated`, New or Updated Event). Cancelled events do not fire it.
2. **Normalize (in code):** start and end are passed through as the ISO 8601 timestamps the trigger sends. Duration is worked out in minutes from them. Attendee emails are joined into one comma-separated string.
3. **Zapier Tables, Find Records:** looks for a row whose Source ID is the event ID. If one exists, the run stops and writes nothing.
4. **Zapier Tables, Create Record:** adds one row with title, start, end, duration, attendees and the event ID as Source ID.

The Zap only adds rows. It never updates or deletes a row in the table.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve calendar and table names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting       | Where                                                        | What goes there                                                                              |
| ------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `CALENDAR_ID` | `config.ts`, and `calendarid` in `triggers/event-updated.ts` | The Google Calendar to watch. For a team, usually a shared calendar rather than one person's |
| `TABLE_ID`    | `config.ts`                                                  | The Zapier Tables table that is the analytics table: its ID, from its URL                    |

Also review the defaults with them:

- `SOURCE_ID_FIELD` (`f6`) is the key of the column that holds the Google Calendar event ID. The create step's `new__data__f1` to `new__data__f6` keys follow the table's column order: Title, Start, End, Duration (minutes), Attendees, Source ID. If their table is laid out differently, map each key to their columns.
- Rows are skipped when their event ID is already in the table. That is the default; changing it means building the Customize item in Notes.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-calendar` (the calendar to watch) and `zapier-tables` (the account that owns the analytics table) to the user's connections. The trigger uses `google-calendar`, and the actions use `zapier-tables`.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/event-updated.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a table ID and field keys that exist in the user's table:

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

Check that the run completes and one new row appears with the title, start `2026-10-30T11:00:00-04:00`, end `2026-10-30T11:45:00-04:00`, duration `45` and the attendee email. Run the same input again and check that no second row is added. If run-status tools aren't available, check the result in Zapier Tables directly. Ask the user to delete the test row; the agent doesn't delete data. Then publish, confirm the trigger is active, and check the next real event.

## Notes

- The trigger is New or Updated Event, so it also fires for newly created events.
- Times are passed through in the calendar's own offset (for example `-04:00`), not converted to UTC. The table stores the text as given.
- The attendee field lists email addresses from the event, comma-separated. It does not list response status.
- To update the existing row instead of skipping it, change the workflow to update when the event ID is found.
- To log only qualifying events, add a conditional step, such as one that checks the calendar or a title pattern.
- Never commit a real table ID or calendar ID. Anyone who can edit the Zap can read where the data goes.
