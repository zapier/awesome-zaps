---
name: assign-on-call-contact-from-next-calendar-event-to-roster
description: Build a Zapier Next Gen Zap that, shortly before a rotation event starts on Google Calendar, writes the on-call contact for that shift into the event description. Use when an engineering team keeps on-call rotations as calendar events and wants the person responsible shown on the event before the shift.
metadata:
  author: zapier
  summary: "Shortly before an on-call shift starts, the calendar event is updated with the responder's contact, so coordinators see who is on call without opening a roster."
  apps: "Google Calendar"
  category: "Engineering"
  job: "Engineering operations"
  source: "https://zapier.com/automations/engineering/engineering-operations/on-call-rotation-management/assign-on-call-contact-from-next-calendar-event-to-roster"
---

# Assign on-call contact from next calendar event to roster

## What it does

1. **Trigger:** Google Calendar, Event Start. It fires 15 minutes before any event on the chosen calendar starts.
2. **Resolve contact (plain code, no app call):** the event title is checked against a roster of rotation names. The first name found sets the contact. If none matches, the default contact is used.
3. **Google Calendar** updates that event's description. Any earlier `On call:` line is removed, then `On call: <contact>` is appended. Attendees are not changed and no invitation is sent.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Calendar, Event Start (`google-calendar`, `event_start`). Set `calendarid` to the rotation calendar's ID, `time_unit` to `minutes` and `time_length` to `15`. Leave search term empty.
2. **Connections** (each alias in the code is the app's slug):
   - `google-calendar`: the user's Google Calendar connection, for the account that owns the rotation calendar and can edit its events.
3. **Constants:**
   - `CALENDAR_ID`: the Google Calendar ID of the rotation calendar. Use the same value as the trigger's `calendarid`.
   - `ROSTER`: rotation names as they appear in event titles, each mapped to the on-call contact's email. Add one line per rotation. Matching is a case-insensitive substring check.
   - `DEFAULT_CONTACT`: the email written when no rotation name matches.
   - `CONTACT_LABEL`: the prefix for the line in the description. Default `"On call:"`; keep it unless the team already uses another label.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user it fires only for events on that calendar.

## Ask the user

- Which Google Calendar holds the rotation events, and which connection owns it?
- Which rotation names appear in event titles, and who is the on-call contact for each? Write them into `ROSTER`.
- Who should be the default contact when no rotation name matches?
- Should the contact go into the event description (this template) or into an attendee slot? An attendee slot invites that person, so it needs a yes.
- Should the workflow stay enabled once it is tested? It runs on every event on that calendar 15 minutes before it starts, so only enable it on a calendar where that is wanted.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use an event on the rotation calendar you can safely edit. Create one titled `[install-test] <rotation name> on-call` if none exists:

```json
{
  "id": "p5dt387smdbp4qn2mhe2shkqjc",
  "summary": "[install-test] platform on-call",
  "description": "[install-test] created by install test; safe to delete",
  "start": { "dateTime": "2026-10-30T06:00:00-04:00" }
}
```

Confirm three things. The event's description ends with one `On call: <contact>` line, and that line is the expected contact. A second run on the same event leaves exactly one `On call:` line, not two. The event's attendees are unchanged. Then delete the test event, or tell the user to.

## Customize

- **Confirmation post:** add a Slack message to the team channel after the contact is written.
- **Alternate fallback roster:** route high-priority events to a second roster, using a second `ROSTER`-style map.

## Notes

- The spec asked to publish the contact to a team roster or usergroup. No roster app was specified, so the template writes the contact into the event description, where coordinators see it. Swap in a roster app's action in step 3 if the team has one.
- The spec's "sub-zap" lookup is done inline. A separate sub-workflow was not built because it had no target.
- Editing an event's description replaces the description, so the template keeps the existing text and only swaps the `On call:` line.
- The workflow fires only for the calendar in the trigger. Use a calendar where editing event descriptions is safe.
- Never commit a real calendar ID or contact email in a shared copy. Replace them with placeholders, as in `workflow.ts`.
- In testing, the fallback contact and the rotation-match contact were the same address, so the test shows the replace behaviour but not that a different default is chosen.
