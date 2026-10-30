---
name: create-company-calendar-events-from-personal-calendar-updates
description: Build a Zapier Next Gen Zap that copies new or updated events from a personal Google Calendar onto a company calendar, creating the copy when it is missing and updating it when it exists. Use when sales ops, account executives or a team need a shared calendar to show the current meeting roster without anyone re-entering events by hand.
metadata:
  author: zapier
  summary: "When you create or change an event on your personal calendar, the matching event on the company calendar is created or updated to match, so the team always sees the current roster."
  apps: "Google Calendar"
  category: "Business Owners"
  job: "Scheduling coordination"
  source: "https://zapier.com/automations/business-owners/scheduling-coordination/calendar-management/create-company-calendar-events-from-personal-calendar-updates"
---

# Create company calendar events from personal calendar updates

## What it does

1. **Trigger:** a Google Calendar event on your personal calendar is created or updated (recurring instances expanded). Cancelled events do not fire it.
2. **Google Calendar** searches the company calendar for the event's ID. The company copy is recognised by a line in its description, `Mirrored from personal calendar event <source event ID>`, because Google gives each calendar its own event IDs.
3. If a copy exists, **Google Calendar** updates it with the title, description, location, start and end. If none exists, **Google Calendar** creates one. Events with no start or end time are skipped.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constant listed below; everything else stays as written.

1. **Trigger:** Google Calendar, New or Updated Event (`google-calendar` / `event_updated`), with `calendarid` set to your personal calendar (your primary calendar's address) and `expand_recurring: true`. This value lives in the trigger, not in the source, so set it when you configure the trigger.
2. **Connections** (each alias in the code is the app's slug):
   - `google-calendar`: the Google Calendar connection for the account that owns the personal calendar. It must also have edit access to the company calendar.
3. **Constants:**
   - `COMPANY_CALENDAR_ID`: the Google Calendar ID of the company calendar that receives the copies. It is the calendar's ID from its settings, usually an address ending in `@group.calendar.google.com` or the owner's email.
   - `MIRROR_MARKER`: the text that marks a copy. Leave the default unless it clashes with something in the calendar.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user what it mirrors.

## Ask the user

- Which personal calendar should the trigger watch? (The primary calendar is the default.)
- Which company calendar should receive the copies, and does the connected account have edit access to it?
- Should events that have no start or end time, such as all-day events, be mirrored? The workflow skips them today.
- Is it acceptable that a copy is matched by the marker line rather than by event ID? (Google event IDs differ between calendars.)

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a test event on your own personal calendar, and point `COMPANY_CALENDAR_ID` at a calendar you can safely write to:

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

Run it twice. The first run should create one event on the company calendar with the same title, location and time, and the marker line at the end of its description. The second run, with a changed title, location or end time, should update that same event: the company calendar should still hold one copy, not two. Then delete the test events from both calendars.

## Customize

- **Mirror only events with external attendees**, or only events from a set of calendars: add a filter before the search step, since the trigger has no attendee condition.
- **Remove the copy when the source is cancelled:** this needs a second workflow using the Event Cancelled trigger, because one workflow has one trigger.
- **Mirror attendees and conferencing links:** add them to the create and update inputs.

## Notes

- Google event IDs differ between calendars, so the copy is found by searching for the source ID in its description. Search covers events that have not yet ended. An update to an event that has already ended therefore creates a second copy.
- Cancelled events are not removed from the company calendar. The trigger skips cancellations, so this workflow never sees them.
- The company copy is not notified to anyone, because no attendees are copied. Add attendees under Customize if the copy should send invitations.
- Never commit a real calendar ID. Anyone who can write to the company calendar can change the events it mirrors.
