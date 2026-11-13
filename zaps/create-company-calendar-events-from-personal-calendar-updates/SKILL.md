---
name: create-company-calendar-events-from-personal-calendar-updates
description: Build a Zap on Zapier that copies new or updated events from a personal Google Calendar onto a company calendar, creating the copy when it is missing and updating it when it exists. Use when sales ops, account executives or a team need a shared calendar to show the current meeting roster without anyone re-entering events by hand.
license: MIT
metadata:
  author: zapier
  summary: "When you create or change an event on your personal calendar, the matching event on the company calendar is created or updated to match, so the team always sees the current roster."
  apps: "Google Calendar"
  category: "Business Owners"
  job: "Scheduling coordination"
  source: "https://zapier.com/automations/business-owners/scheduling-coordination/calendar-management/create-company-calendar-events-from-personal-calendar-updates"
---

# Create company calendar events from personal calendar updates

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-company-calendar-events-from-personal-calendar-updates. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Google Calendar event on the personal calendar is created or updated (`google-calendar`, `event_updated`, recurring instances expanded). Cancelled events do not fire it.
2. **Google Calendar** searches the company calendar for the event's ID. The company copy is recognised by a line in its description, `Mirrored from personal calendar event <source event ID>`, because Google gives each calendar its own event IDs.
3. If a copy exists, **Google Calendar** updates it with the title, description, location, start and end. If none exists, **Google Calendar** creates one. Events with no start or end time are skipped.

The Zap never deletes a company event. A cancelled source event leaves its copy in place.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve calendar names to IDs with the user's own Google Calendar connection; don't ask them to paste an ID you can look up.

| Setting                        | Where                                     | What goes there                                                                                                        |
| ------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_PERSONAL_CALENDAR_ID` | `triggers/event-updated.ts`, `calendarid` | The personal calendar the trigger watches. The primary calendar is the default, and its ID is the user's email address |
| `REPLACE_COMPANY_CALENDAR_ID`  | `config.ts`                               | The company calendar that receives the copies. The connected account needs edit access to it                           |

Also review the defaults with them: `MIRROR_MARKER` (leave the default unless it clashes with something in the calendar) and `expand_recurring` in the trigger (`true`, so each recurring instance is mirrored).

Confirm two things before turning it on:

- Should events with no start or end time, such as all-day events, be mirrored? The workflow skips them today.
- Is it acceptable that a copy is matched by the marker line rather than by event ID? Google event IDs differ between calendars.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-calendar` to the user's Google Calendar connection for the account that owns the personal calendar. The trigger and the actions use the same one, and it needs edit access to the company calendar. No other apps are used.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/event-updated.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, including `calendarid` and `expand_recurring`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connection and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run before publishing. Use a test event on the user's own personal calendar, and point `COMPANY_CALENDAR_ID` at a calendar that is safe to write to:

```json
{
  "id": "hjerpm2k1ov4vq2uf6215hg718",
  "summary": "[install-test] Mirror source event",
  "description": "[install-test] Sample personal-calendar event for the mirror workflow test. Safe to delete.",
  "location": "[install-test] Room 1",
  "status": "confirmed",
  "start": { "dateTime": "2026-11-03T15:00:00-05:00" },
  "end": { "dateTime": "2026-11-03T15:30:00-05:00" }
}
```

Run it twice. The first run should create one event on the company calendar with the same title, location and time, and the marker line at the end of its description. The second run, with a changed title, location or end time, should update that same event: the company calendar should still hold one copy, not two. If run-status tools aren't available, check the result in Google Calendar directly. The user deletes the test events from both calendars, not the agent. Then publish, confirm the trigger is active, and tell the user what it mirrors.

## Notes

- The copy is found by searching for the source ID in its description. Search covers only events that have not yet ended, so an update to an event that has already ended creates a second copy.
- The trigger skips cancellations, so the company copy of a cancelled event is never removed.
- No attendees are copied, so the company copy sends no invitations. Add attendees to the create and update inputs if it should.
- To mirror only some events, such as those with external attendees, add a filter before the search step. To remove copies when the source is cancelled, build a second workflow on the Event Cancelled trigger, since one workflow has one trigger.
- Anyone who can write to the company calendar can change the events it mirrors.
