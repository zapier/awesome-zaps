---
name: update-on-call-contact-group-when-rotation-event-starts
description: Build a Zapier Next Gen Zap that, when an on-call rotation event starts on a Google Calendar, normalizes the rotation name from the event title and posts it, with the handoff time, attendees and a default contact set, to a reusable routing workflow that updates the on-call contact group. Use when an engineering or support team schedules on-call rotations as calendar events and wants the paging or contact group to follow the active rotation automatically.
metadata:
  author: zapier
  summary: "When an on-call rotation event starts on your calendar, the rotation is identified and handed to your routing workflow with the handoff time and default contacts, so the on-call contact group follows the active rotation."
  apps: "Google Calendar, Webhooks by Zapier"
  category: "Engineering"
  job: "Engineering operations"
  source: "https://zapier.com/automations/engineering/engineering-operations/on-call-rotation-management/update-on-call-contact-group-when-rotation-event-starts"
---

# Update on-call contact group when rotation event starts

## What it does

1. **Trigger:** Google Calendar, Event Start. It fires a set time (15 minutes by default) before an event on the on-call calendar starts. The trigger record already carries the event details (title, start, attendees), so there is no separate "get event" step.
2. **Normalize** (plain code): the event title is lowercased, and `[tags]`, `(notes)`, "Week N" and filler words (on-call, rotation, shift, handoff) are stripped, then it is kebab-cased. `"[install-test] Platform Primary On-Call (Week 44)"` becomes `platform-primary`. If the result is in `KNOWN_ROTATIONS`, it is the rotation; otherwise `FALLBACK_ROTATION` is sent with `rotation_matched: false`.
3. **Webhooks by Zapier** (Custom Request, POST JSON) calls the routing workflow's catch hook with `rotation_id`, `rotation_matched`, `raw_summary`, `effective_at` (event start), `group_members` and `fallback_contacts` (both `DEFAULT_CONTACTS`), `attendees` (when present), `event_id` and `event_link`.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Calendar, Event Start (`google-calendar`, `event_start`; tested on `google-calendar`). `authentication_id` is the user's Google Calendar connection ID. Params: `calendarid` (the on-call calendar's ID, from `get_trigger_field_choices`), `time_length` (default `15`) and `time_unit` (`"minutes"`). Leave `search_term` empty unless the user wants a keyword filter (see Customize).
2. **Connections** (each alias in the code is the app's slug):
   - `google-calendar`: used only by the trigger, for the account that can see the on-call calendar.
   - `webhook`: no connection needed; no alias.
3. **Constants:**
   - `ROUTING_WEBHOOK_URL`: the catch-hook URL of the routing workflow (a Zap or Next Gen Zap with a Webhooks catch hook) that updates the contact group.
   - `KNOWN_ROTATIONS`: the canonical rotation IDs, in normalized form (lowercase kebab-case, e.g. `"platform-primary"`).
   - `FALLBACK_ROTATION`: the ID sent when nothing matches. Defaults to `"default"`.
   - `DEFAULT_CONTACTS`: the default contact set (email addresses or IDs the routing workflow understands).
4. Test with the steps below, then publish, wait until the trigger is active, and confirm the enabled state the user wants.

## Ask the user

- Which calendar holds the on-call rotation events?
- What is the routing workflow's webhook URL? If they don't have one yet, they need to build it first (it receives this payload and changes group membership).
- What are the rotation names, as they appear in event titles? Normalize each one and show them the resulting `KNOWN_ROTATIONS`.
- Who is in the default contact set?
- Is 15 minutes before the start acceptable, or should it be closer to the start (the trigger can't fire at exactly the start time)?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. It is the trigger record's shape. Point `ROUTING_WEBHOOK_URL` at an echo endpoint or a test catch hook first, so the test changes no real group:

```json
{
  "kind": "calendar#event",
  "id": "EVENT_ID",
  "status": "confirmed",
  "htmlLink": "https://www.google.com/calendar/event?eid=EVENT_EID",
  "summary": "[install-test] Platform Primary On-Call (Week 44)",
  "start": {
    "dateTime": "2026-10-30T09:00:00-04:00",
    "timeZone": "America/New_York"
  },
  "end": {
    "dateTime": "2026-10-30T10:00:00-04:00",
    "timeZone": "America/New_York"
  },
  "attendees": [{ "email": "you@example.com", "responseStatus": "accepted" }],
  "attendee_emails": "you@example.com"
}
```

Check that the run output shows `rotation: "platform-primary"`, `matched: true`, and `effectiveAt` equal to the event start, and that the receiving endpoint got the same payload. For the fallback path, change the summary to something unknown and expect `rotation: "default"`, `matched: false`.

## Customize

- **Keyword filter:** only run for events containing a rotation tag or keyword. Set the trigger's `search_term`, or add an early return when the summary lacks the tag.
- **Attendee-based mapping:** for ad-hoc swaps or overrides, use the event's attendees as `group_members` instead of the defaults when the event is marked as a swap.

## Notes

- The original Zap called a Sub-Zap. Next Gen Zaps call the reusable routing workflow through its catch-hook URL instead, so that workflow needs a Webhooks catch-hook trigger.
- Event Start fires before the event (15 minutes by default), not at the exact start. `effective_at` is still the real start time, so the routing workflow can schedule the change or apply it right away.
- The trigger record's `attendees` is often absent. The code falls back to the comma-separated `attendee_emails` field and sends an empty list when neither is set.
- All-day events have `start.date` instead of `start.dateTime`. The code uses whichever is present.
- Never commit a real webhook URL. Anyone with it can change your on-call group.
