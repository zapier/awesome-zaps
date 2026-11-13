---
name: create-structured-meeting-records-in-your-tracking-sheet
description: Build a Zap on Zapier that appends a normalized meeting record to a Google Sheets tracker each time a Google Calendar event is created or updated. Use when a team keeps a central sheet of meetings for reporting and wants every event captured in a consistent row without manual entry.
license: MIT
metadata:
  author: zapier
  summary: "Every time a calendar event is created or updated, a clean row with its title, organizer, start time and attendees goes into your tracking sheet."
  apps: "Google Calendar, Google Sheets"
  category: "Personal Productivity"
  job: "Spreadsheet automation"
  source: "https://zapier.com/automations/personal-productivity/spreadsheet-automation/google-sheets-automation/create-structured-meeting-records-in-your-tracking-sheet"
---

# Create structured meeting records in your tracking sheet

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-structured-meeting-records-in-your-tracking-sheet. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Google Calendar event is created or updated (`google-calendar`, `event_updated`) on the calendar you choose.
2. **Normalize:** the Zap keeps the event ID, title, organizer email, start time (with the calendar's own UTC offset) and attendee emails as one comma-separated string. It also keeps the created and updated timestamps from the event. Events without an ID are skipped.
3. **Google Sheets** appends one new row to the worksheet you choose, with each field in its column. Every update adds a new row, so the sheet keeps a history; match rows on the event ID when you report.

The Zap only appends rows. It never edits or deletes existing ones.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | What goes there                                                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_CALENDAR_ID`    | The calendar the trigger watches, as its email or ID. Set the same value as the trigger's Calendar setting; the code does not read it. |
| `REPLACE_SPREADSHEET_ID` | The tracker spreadsheet: the long ID in its URL                                                                                        |
| `REPLACE_WORKSHEET_ID`   | The tab for these records. Use a dedicated tab; the first tab is `"0"`.                                                                |

Also review the defaults with them: the column constants `EVENT_ID_COLUMN`, `TITLE_COLUMN`, `ORGANIZER_COLUMN`, `START_COLUMN`, `ATTENDEES_COLUMN`, `CREATED_COLUMN` and `UPDATED_COLUMN` are column keys such as `COL$A`, not header names. Map the user's headers to their column letters.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` to the user's Google Sheets connection for the account that owns the tracking sheet. Bind the trigger to the user's `google-calendar` connection for the calendar it watches. No other apps are used.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/event-updated.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the Google Sheets action's fields with the user's connection, and sample the trigger, before the first test run. Fix any key in `workflow.ts` that doesn't match.

## Test it

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

Check that one new row appears with each field in its column, that the start time keeps its offset, and that the attendees sit in one cell. If run-status tools aren't available, check the result in Google Sheets directly. Then ask the user to delete the test row; the user deletes test data, not the agent.

## Notes

- The Zap watches the chosen calendar with `expand_recurring` on, so each instance of a recurring event is recorded.
- Google Sheets may show the start time in the sheet's own format and time zone, depending on the column's formatting.
- The trigger's field names (such as `start__dateTime` and `organizer__email`) come from the Google Calendar trigger's output. If they differ in the user's account, fix the keys in `workflow.ts` as step 4 says.
- To record only some events, add a filter so only events with attendees, or with a chosen visibility, are written. To flag events with no organizer email, add a Slack or email step.
- Never commit a real calendar ID, spreadsheet ID or worksheet ID.
