---
name: update-active-rotation-event-to-current-on-call-contact
description: Build a Zapier Next Gen Zap that watches an on-call rotation calendar and, when a rotation event becomes active (its start and end cover the current time), posts the active on-call contact to a routing channel. Use when an engineering team keeps its on-call rotation in Google Calendar and wants the current responder applied as soon as the rotation starts.
metadata:
  author: zapier
  summary: "When a rotation event on your on-call calendar is active right now, its contact is posted to your routing channel so the current on-call is applied immediately."
  apps: "Google Calendar, Slack"
  category: "Engineering"
  job: "Engineering operations"
  source: "https://zapier.com/automations/engineering/engineering-operations/on-call-rotation-management/update-active-rotation-event-to-current-on-call-contact"
---

# Update active rotation event to current on-call contact

## What it does

1. **Trigger:** a Google Calendar event is created or updated on the rotation calendar (`event_updated`, recurring instances expanded).
2. **Clock check:** reads the current time and checks whether the event's start is at or before now and its end is after now. If not, the run stops and posts nothing.
3. **Contact:** uses the event title as the contact handle. If the title is empty, it uses the default member list.
4. **Routing:** posts one message to the routing channel with the handle, the active window and the members. This stands in for the spec's sub-workflow call.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Calendar, New or Updated Event (`google-calendar` / `event_updated`), with `expand_recurring: true`. Its `authentication_id` is the user's Google Calendar connection.
2. **Connections** (each alias in the code is the app's slug):
   - `google-calendar`: the trigger's calendar connection. Use the account that owns the rotation calendar.
   - `slack`: the Slack connection for the workspace that holds the routing channel.
3. **Constants:**
   - `CALENDAR_ID`: the calendar the trigger watches (its email or calendar ID). Set it as the trigger's `calendarid`; the code does not read it.
   - `ROUTING_CHANNEL`: the Slack channel ID that receives the routing message.
   - `DEFAULT_MEMBERS`: the members to hand to routing when an event title gives no handle.
   - `MENTION_CHANNEL`: `false` by default. Set to `true` only if the routing message should ping the channel with `@channel`.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the trigger's setup details.

## Ask the user

- Which calendar holds the rotation, and which Google account owns it?
- Which Slack channel should receive the routing message? Its ID is the value for `ROUTING_CHANNEL`.
- What is the default member list for events with no handle in their title?
- What should the routing step do: post to a channel (as built here), call a routing sub-workflow, or update a group? The spec names a sub-workflow but not which one.
- Should the routing message mention `@channel`? (Default: no.)

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a `[install-test]` event on the rotation calendar whose window covers the current time:

```json
{
  "id": "EVENT_ID",
  "summary": "[install-test] On-call rotation",
  "start": { "dateTime": "2026-10-29T18:50:00-04:00" },
  "end": { "dateTime": "2026-10-29T22:00:00-04:00" }
}
```

Set the `start` and `end` so the window covers the moment you run it. Then check:

- **Active path:** the run output has `skipped` absent, `routed.ok` true, and a `permalink` for the message in the routing channel. The message should show the event title, the window and the members.
- **Filter path:** run again with a window that has already ended. The output should be `reason: "event-not-active"`, and the only operation that ran should be `capture-checked-at`. No message is posted.

Afterwards, delete the test message and test event if they were real data.

## Customize

- **Notify on routing change:** add a Slack or email step after routing, only when the active contact differs from the last one posted.
- **Urgency tag:** add a field to the routing payload for high-priority rotations, based on a calendar color or a name in the title.

## Notes

- The clock check uses the time the run reaches it, so a replayed run keeps its first check time.
- `end` is exclusive: an event that has just ended is no longer active.
- Google Calendar sends start and end as `start.dateTime` and `end.dateTime`. The code reads that shape.
- If two events overlap, each one that updates posts its own message. Add de-duplication if that is noisy.
- Anyone who can post to the routing channel can see the on-call contact. Keep the channel appropriate for that.
