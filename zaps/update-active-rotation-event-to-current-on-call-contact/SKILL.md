---
name: update-active-rotation-event-to-current-on-call-contact
description: Build a Zap on Zapier that watches an on-call rotation calendar and, when a rotation event becomes active (its start and end cover the current time), posts the active on-call contact to a routing channel. Use when an engineering team keeps its on-call rotation in Google Calendar and wants the current responder applied as soon as the rotation starts.
license: MIT
metadata:
  author: zapier
  summary: "When a rotation event on your on-call calendar is active right now, its contact is posted to your routing channel so the current on-call is applied immediately."
  apps: "Google Calendar, Slack"
  category: "Engineering"
  job: "Engineering operations"
  source: "https://zapier.com/automations/engineering/engineering-operations/on-call-rotation-management/update-active-rotation-event-to-current-on-call-contact"
---

# Update active rotation event to current on-call contact

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-active-rotation-event-to-current-on-call-contact. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Google Calendar event is created or updated on the rotation calendar (`google-calendar`, `event_updated`).
2. **Clock check:** reads the current time and checks whether the event's start is at or before now and its end is after now. If not, the run stops and posts nothing.
3. **Contact:** uses the event title as the contact handle. If the title is empty, it uses the default member list.
4. **Routing:** posts one message to the routing channel (`slack`) with the handle, the active window and the members.

The Zap never posts for an event that isn't active at the moment it runs.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                        | Where         | What goes there                                                              |
| ------------------------------ | ------------- | ---------------------------------------------------------------------------- |
| `REPLACE_CALENDAR_ID`          | `config.ts`   | The rotation calendar. The trigger watches it, and the code does not read it |
| `REPLACE_ROUTING_CHANNEL`      | `config.ts`   | The Slack channel that gets the routing message                              |
| `REPLACE_DEFAULT_MEMBER_EMAIL` | `workflow.ts` | The people routed to when an event title gives no handle, as email addresses |

Also review the default with them: `MENTION_CHANNEL` in `workflow.ts` (`false`). Set it to `true` only if the routing message should ping the channel with `@channel`.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-calendar` to the user's Google Calendar connection for the account that owns the rotation calendar (the trigger uses it). Bind `slack` to the user's Slack connection for the workspace that holds the routing channel (it posts the routing message).
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/event-updated.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

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

If run-status tools aren't available, check the result in Slack directly. Ask the user to delete the test message and test event.

## Notes

- The clock check uses the time the run reaches it, so a replayed run keeps its first check time.
- `end` is exclusive: an event that has just ended is no longer active.
- Google Calendar sends start and end as `start.dateTime` and `end.dateTime`. The code reads that shape.
- If two events overlap, each one that updates posts its own message. Add de-duplication if that is noisy.
- Anyone who can post to the routing channel can see the on-call contact. Keep the channel appropriate for that.
- To notify on a routing change, add a Slack or email step after routing that runs only when the active contact differs from the last one posted.
- To flag urgent rotations, add a field to the routing payload, based on a calendar color or a name in the title.
