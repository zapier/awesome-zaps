---
name: assign-on-call-contact-from-next-calendar-event-to-roster
description: Build a Zap on Zapier that, shortly before a rotation event starts on Google Calendar, writes the on-call contact for that shift into the event description. Use when an engineering team keeps on-call rotations as calendar events and wants the person responsible shown on the event before the shift.
license: MIT
metadata:
  author: zapier
  summary: "Shortly before an on-call shift starts, the calendar event is updated with the responder's contact, so coordinators see who is on call without opening a roster."
  apps: "Google Calendar"
  category: "Engineering"
  job: "Engineering operations"
  source: "https://zapier.com/automations/engineering/engineering-operations/on-call-rotation-management/assign-on-call-contact-from-next-calendar-event-to-roster"
---

# Assign on-call contact from next calendar event to roster

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/assign-on-call-contact-from-next-calendar-event-to-roster. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** `google-calendar`, Event Start (`event_start`). It fires 15 minutes before any event on the chosen calendar starts.
2. **Resolve contact:** the event title is checked against a roster of rotation names. The first name found sets the contact. If none matches, the default contact is used.
3. **`google-calendar`** updates that event's description. Any earlier `On call:` line is removed, then `On call: <contact>` is appended.

Attendees are not changed and no invitation is sent.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                   | Where                                                               | What goes there                                                                                                         |
| ------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_CALENDAR_ID`     | `triggers/event-start.ts`, `calendarid`; `config.ts`, `CALENDAR_ID` | The Google Calendar that holds the rotation events. The trigger watches it and the update writes to its events.         |
| `REPLACE_DEFAULT_CONTACT` | `config.ts`, `DEFAULT_CONTACT`                                      | The email written when no rotation name in the event title matches `ROSTER`.                                            |
| `REPLACE_ROTATION_NAME`   | `workflow.ts`, `ROSTER` (key)                                       | A rotation's name as it appears in event titles. Matching is a case-insensitive substring check. One line per rotation. |
| `REPLACE_CONTACT_EMAIL`   | `workflow.ts`, `ROSTER` (value)                                     | That rotation's on-call contact, as an email address.                                                                   |

Also review the defaults with them: `CONTACT_LABEL` (`"On call:"`, the prefix for the line in the description; keep it unless the team already uses another label).

Before turning it on, confirm the user is happy for the workflow to run on every event on that calendar 15 minutes before it starts, so it should only be enabled on a calendar where that is wanted.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-calendar` to the user's Google Calendar connection for the account that owns the rotation calendar and can edit its events. The trigger and the action use the same one. No other app needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/event-start.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, including `calendarid`, `time_unit` (`minutes`) and `time_length` (`15`). The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connection and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test (`run_workflow_draft` in Zapier MCP) against an event on the rotation calendar that the user can safely edit. Use an event like this one, titled for a rotation the user has in `ROSTER`:

```json
{
  "id": "p5dt387smdbp4qn2mhe2shkqjc",
  "summary": "[install-test] platform on-call",
  "description": "[install-test] created by install test; safe to delete",
  "start": { "dateTime": "2026-10-30T06:00:00-04:00" }
}
```

Confirm three things. The event's description ends with one `On call: <contact>` line, and that line is the expected contact. A second run on the same event leaves exactly one `On call:` line, not two. The event's attendees are unchanged. If run-status tools aren't available, check the event in Google Calendar directly. Ask the user to delete the test event; the agent doesn't delete test data. Then publish and confirm the trigger is active.

## Notes

- The spec asked to publish the contact to a team roster or usergroup. No roster app was specified, so the Zap writes the contact into the event description, where coordinators see it. Swap in a roster app's action if the team has one.
- The contact goes into the description, not an attendee slot. An attendee slot would invite that person, which needs their agreement.
- Editing an event's description replaces it, so the Zap keeps the existing text and only swaps the `On call:` line.
- The Zap fires only for the calendar in the trigger. Use a calendar where editing event descriptions is safe.
- The Zap's sub-lookup is done inline: no separate sub-workflow was needed.
- To post a confirmation after the contact is written, add a Slack message to the team channel after the update.
- To route high-priority events to a second roster, add a second map in `workflow.ts` and choose it by event title.
- Never commit a real calendar ID or contact email in a shared copy. Replace them with placeholders, as in `workflow.ts`.
