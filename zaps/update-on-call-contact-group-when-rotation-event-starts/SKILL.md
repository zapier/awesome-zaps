---
name: update-on-call-contact-group-when-rotation-event-starts
description: Build a Zap on Zapier that, when an on-call rotation event starts on a Google Calendar, normalizes the rotation name from the event title and posts it, with the handoff time, attendees and a default contact set, to a reusable routing workflow that updates the on-call contact group. Use when an engineering or support team schedules on-call rotations as calendar events and wants the paging or contact group to follow the active rotation automatically.
license: MIT
metadata:
  author: zapier
  summary: "When an on-call rotation event starts on your calendar, the rotation is identified and handed to your routing workflow with the handoff time and default contacts, so the on-call contact group follows the active rotation."
  apps: "Google Calendar, Webhooks by Zapier"
  category: "Engineering"
  job: "Engineering operations"
  source: "https://zapier.com/automations/engineering/engineering-operations/on-call-rotation-management/update-on-call-contact-group-when-rotation-event-starts"
---

# Update on-call contact group when rotation event starts

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-on-call-contact-group-when-rotation-event-starts. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** Google Calendar event start (`google-calendar`, `event_start`). It fires a set time (15 minutes by default) before an event on the on-call calendar starts. The trigger record already carries the event details (title, start, attendees), so there is no separate "get event" step.
2. **Normalize** (plain code): the event title is lowercased, and `[tags]`, `(notes)`, "Week N" and filler words (on-call, rotation, shift, handoff) are stripped, then it is kebab-cased. `"[install-test] Platform Primary On-Call (Week 44)"` becomes `platform-primary`. If the result is in `KNOWN_ROTATIONS`, it is the rotation; otherwise `FALLBACK_ROTATION` is sent with `rotation_matched: false`.
3. **Webhooks by Zapier** (Custom Request, POST JSON) calls the routing workflow's catch hook with `rotation_id`, `rotation_matched`, `raw_summary`, `effective_at` (event start), `group_members` and `fallback_contacts` (both `DEFAULT_CONTACTS`), `attendees` (when present), `event_id` and `event_link`.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve calendar names to IDs with the user's own Google Calendar connection; don't ask them to paste an ID you can look up.

| Setting                         | Where                                   | What goes there                                                           |
| ------------------------------- | --------------------------------------- | ------------------------------------------------------------------------- |
| `REPLACE_ON_CALL_CALENDAR_ID`   | `triggers/event-start.ts`, `calendarid` | The calendar that holds the on-call rotation events                       |
| `REPLACE_ROUTING_WEBHOOK_URL`   | `config.ts`, `ROUTING_WEBHOOK_URL`      | The catch-hook URL of the routing workflow that updates the contact group |
| `REPLACE_DEFAULT_CONTACT_EMAIL` | `config.ts`, `DEFAULT_CONTACTS`         | Each email address in the default contact set, one entry per person       |

The routing workflow must exist before the Zap is tested. It needs a Webhooks catch-hook trigger, because it receives this payload and changes group membership.

Also review the defaults with them: `KNOWN_ROTATIONS` in `workflow.ts` (the rotation IDs, in lowercase kebab-case, from the names as they appear in event titles), `FALLBACK_ROTATION` in `config.ts` (`"default"`), and the 15-minute trigger time in `triggers/event-start.ts`. Is 15 minutes before the start acceptable, or should it be closer to the start? The trigger can't fire at exactly the start time.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-calendar` (the account that can see the on-call calendar) to the user's connection for the trigger. `workflow.ts` uses no connection alias, and Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/event-start.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Point `ROUTING_WEBHOOK_URL` at an echo endpoint or a test catch hook first, so the test changes no real group. Then run this sample as a draft test:

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

Check that the run output shows `rotation: "platform-primary"`, `matched: true`, and `effectiveAt` equal to the event start, and that the receiving endpoint got the same payload. For the fallback path, change the summary to something unknown and expect `rotation: "default"`, `matched: false`. If run-status tools aren't available, check the result at the test endpoint directly. Then publish, confirm the trigger is active, and confirm the enabled state the user wants. The user deletes any test data, not the agent.

## Notes

- Keyword filter: to run only for events with a rotation tag or keyword, set the trigger's `search_term`, or add an early return when the summary lacks the tag.
- Attendee-based mapping: for ad-hoc swaps, use the event's attendees as `group_members` instead of the defaults when the event is marked as a swap.
- Event start fires before the event, not at the exact start. `effective_at` is still the real start time, so the routing workflow can schedule the change or apply it right away.
- The trigger record's `attendees` is often absent. The code falls back to the comma-separated `attendee_emails` field and sends an empty list when neither is set. All-day events have `start.date` instead of `start.dateTime`; the code uses whichever is present.
- Never commit a real webhook URL. Anyone with it can change your on-call group.
