---
name: create-leave-calendar-events-and-send-approval-emails
description: Build a Zap on Zapier that, when an approver clicks a button on a leave request in Zapier Tables, creates the leave on a Google Calendar, emails the requester the approval and decrements their allowance in a leave tracker. Use when an HR or people team logs time-off requests in Zapier Tables and wants approved leave to reach the calendar, the requester and the allowance without manual edits.
license: MIT
metadata:
  author: zapier
  summary: "When an approver confirms a leave request, the leave lands on the team calendar, the requester gets an approval email, and their allowance is updated."
  apps: "Zapier Tables, Google Calendar, Gmail"
  category: "Human Resources (HR)"
  job: "HR operations"
  source: "https://zapier.com/automations/human-resources-hr/hr-operations/time-off-requests/create-leave-calendar-events-and-send-approval-emails"
---

# Create leave calendar events and send approval emails

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-leave-calendar-events-and-send-approval-emails. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** an approver clicks the button on a leave request record in a Zapier Tables leave requests table (`zapier-tables`, `button_click_record`).
2. **Google Calendar** creates the leave event on the chosen calendar, with the requester as an attendee. Full-day requests become all-day events; partial-day requests become timed events.
3. **Gmail** sends the requester an approval email with the event's details, a link to the calendar event and how to change it.
4. **Zapier Tables** finds the requester's row in the leave tracker by email (or creates one if there is none) and decrements its allowance by the leave taken: days for full-day requests, hours for partial-day requests.

If the request is missing its email, dates or (for partial days) times, the run stops and creates nothing.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                   | What goes there                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `LEAVE_REQUESTS_TABLE_ID` | The Zapier Tables table of leave requests. The trigger is set to this table, and its button is what approvers click |
| `LEAVE_TRACKER_TABLE_ID`  | The table with one row per requester: email in `data__f1`, name in `data__f2`, allowance in `data__f3`              |
| `CALENDAR_ID`             | The Google Calendar that receives approved leave, as the calendar's email address                                   |

Also review the defaults with them: a requester with no tracker row starts at 0 allowance (set in `workflow.ts`), so the first approval takes it negative unless they set a real starting balance first. `EDIT_INSTRUCTIONS` in `workflow.ts` is the line added to the approval email.

Confirm before building: which leave request fields hold the requester name, email, leave type, start and end dates, start and end times, and the full-day flag; and which time zone the leave times are in, since the calendar event uses the calendar's own time zone.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `zapier-tables` (the table set and the leave tracker), `google-calendar` (the calendar that receives the leave events) and `gmail` (sends the approval emails) to the user's connections. No app needs a connection beyond these three.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/button-click-record.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a leave request row you created for the test, and put that row's ID in `record_id`. Set `f2` to an address you control, such as the connected Gmail account, so the approval email goes only there:

```json
{
  "record_id": "TEST_RECORD_ID",
  "new": {
    "data": {
      "f1": "Test Requester",
      "f2": "tester@example.com",
      "f3": "Annual",
      "f4": "2026-11-02T00:00:00.000Z",
      "f5": "2026-11-02T00:00:00.000Z",
      "f6": null,
      "f7": null,
      "f8": true
    }
  }
}
```

Check that the all-day event for 2 November appears on the chosen calendar with the requester as an attendee, that the approval email arrives with the event link, and that the tracker row for that address has its allowance reduced by 1. If run-status tools aren't available, check Google Calendar, Gmail and Zapier Tables directly. Then ask the user to delete the test calendar event, test email and test rows, or change them back if they were real data. Publish only after the test passes, and confirm the trigger is active.

## Notes

- Full-day requests count inclusive days: a request from 2 to 4 November takes 3 days, and a single full day takes 1. Partial-day requests take their length in hours, from start time to end time, so a single partial day is counted in hours, not as 1 day.
- A requester with no tracker row gets one created at 0 allowance, then reduced. Set the starting allowance first if the tracker should begin at a real balance.
- Keep real table IDs, calendar IDs and email addresses out of committed files; anyone who can read the workflow source can see them.
- To extend it: post each approval to a Slack or Teams channel so managers see it, or choose the calendar by the requester's department or office instead of one fixed `CALENDAR_ID`.
