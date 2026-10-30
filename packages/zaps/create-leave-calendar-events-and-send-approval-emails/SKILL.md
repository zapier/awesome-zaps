---
name: create-leave-calendar-events-and-send-approval-emails
description: Build a Zapier Next Gen Zap that, when an approver clicks a button on a leave request in Zapier Tables, creates the leave on a Google Calendar, emails the requester the approval and decrements their allowance in a leave tracker. Use when an HR or people team logs time-off requests in Zapier Tables and wants approved leave to reach the calendar, the requester and the allowance without manual edits.
metadata:
  author: zapier
  summary: "When an approver confirms a leave request, the leave lands on the team calendar, the requester gets an approval email, and their allowance is updated."
  apps: "Zapier Tables, Google Calendar, Gmail"
  category: "Human Resources (HR)"
  job: "HR operations"
  source: "https://zapier.com/automations/human-resources-hr/hr-operations/time-off-requests/create-leave-calendar-events-and-send-approval-emails"
---

# Create leave calendar events and send approval emails

## What it does

1. **Trigger:** an approver clicks the button on a leave request record in a Zapier Tables leave requests table.
2. **Google Calendar** creates the leave event on the chosen calendar, with the requester as an attendee. Full-day requests become all-day events; partial-day requests become timed events.
3. **Gmail** sends the requester an approval email with the event's details, a link to the calendar event and how to change it.
4. **Zapier Tables** finds the requester's row in the leave tracker by email (or creates one if there is none) and decrements its allowance by the leave taken: days for full-day requests, hours for partial-day requests.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Zapier Tables, Trigger Zap Button Clicked (`zapier-tables`, `button_click_record`), set to the leave requests table. It needs the Zapier Tables connection, so its `authentication_id` is that connection's ID.
2. **Connections** (each alias in the code is the app's slug):
   - `zapier-tables`: the Zapier Tables connection for the table set and the leave tracker.
   - `google-calendar`: the Google Calendar connection for the calendar that receives the leave events.
   - `gmail`: the Gmail connection that sends the approval emails.
3. **Constants:**
   - `LEAVE_REQUESTS_TABLE_ID`: the Zapier Tables table the leave requests are logged in. Its button is the trigger.
   - `LEAVE_TRACKER_TABLE_ID`: the table with one row per person: email in `data__f1`, name in `data__f2`, allowance in `data__f3`.
   - `CALENDAR_ID`: the calendar the approved leave goes on, as the calendar's email address.
   - `EDIT_INSTRUCTIONS`: the line added to the approval email. Change the wording if you like.
4. Test with the steps below, then publish, wait until the trigger is active, and add the button to the leave requests table for approvers.

## Ask the user

- Which Zapier Tables table holds leave requests, and which column holds each of these: requester name, requester email, leave type, start date, end date, start time, end time, full-day flag?
- Which Zapier Tables table is the leave tracker, and which columns hold the requester email, name and allowance remaining?
- Which Google Calendar should receive approved leave?
- What allowance should a requester without a tracker row start with? The workflow creates the row at 0, so the first approval takes it negative unless this is changed.
- Which time zone are the leave times in? The calendar event uses the calendar's own time zone.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use the connected Gmail address as the requester's email, so the approval email goes only to the account you are testing with. Use a leave request row you created for the test, and put that row's ID in `record_id`:

```json
{
  "record_id": "YOUR_TEST_RECORD_ID",
  "new": {
    "data": {
      "f1": "Test Requester",
      "f2": "YOUR_CONNECTED_GMAIL_ADDRESS",
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

Check that: the all-day event for 2 November appears on the chosen calendar with the requester as an attendee; the approval email arrives at the connected Gmail address with the event link; and the tracker row for that address has its allowance reduced by 1. Then remove the test calendar event, the test email and the test rows, or change them back if they were real data.

## Customize

- **Alert the HR channel:** add a Slack or Teams message after the approval so managers see each approval.
- **Route by department or location:** choose the calendar from the requester's department or office instead of one fixed `CALENDAR_ID`.

## Notes

- Full-day requests count inclusive days: a request from 2 to 4 November takes 3 days. A single full day takes 1.
- Partial-day requests take their length in hours, from the start time to the end time. A single partial day is therefore counted in hours, not as 1 day.
- A requester with no tracker row gets one created at 0 allowance, then reduced. Set the starting allowance first if your tracker should begin at a real balance.
- If the leave request is missing its email, dates or (for partial days) times, the run stops without creating anything and says why.
- Never commit real table IDs, calendar IDs or email addresses. Anyone who can read the workflow source can see them.
