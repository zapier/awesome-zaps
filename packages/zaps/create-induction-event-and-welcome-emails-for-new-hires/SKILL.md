---
name: create-induction-event-and-welcome-emails-for-new-hires
description: Build a Zapier Next Gen Zap that, when a new hire's start date is entered in a Zapier Tables onboarding table, emails the new hire a welcome, notifies IT and license owners, and creates an induction calendar event. Use when an HR or people team keeps new hires in a table and wants onboarding messages and the induction event sent automatically.
metadata:
  author: zapier
  summary: "When a new hire's start date is added to your onboarding table, they get a welcome email, IT gets a provisioning email, and an induction event goes on the HR calendar."
  apps: "Zapier Tables, Gmail, Google Calendar"
  category: "Human Resources (HR)"
  job: "Talent pipeline management"
  source: "https://zapier.com/automations/human-resources-hr/talent-pipeline-management/employee-onboarding/create-induction-event-and-welcome-emails-for-new-hires"
---

# Create induction event and welcome emails for new hires

## What it does

1. **Trigger:** a record in a Zapier Tables table is updated (Updated Record).
2. **Checks:** the record must have a start date and a valid contact email, and must not already have an Invited At value. Otherwise the run stops and writes nothing.
3. **Zapier Tables** sets Invited At on the record, so later updates to the same record do not send the emails again.
4. **Gmail** sends a welcome email to the new hire, CC'ing the HR coordinator. The body includes the start date (formatted as "November 12, 2026") and the induction link from the record.
5. **Gmail** sends one internal email to the IT and license-owner addresses with the new hire's name, email, start date, hiring manager and induction link.
6. **Google Calendar** creates an induction event on the HR calendar, one day before the start date, one hour long. The hiring manager and IT are invited.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Zapier Tables, Updated Record (`zapier-tables`, `updated_record`), with `table_id` set to the table that holds the new-hire records. It uses the Zapier Tables connection as its authentication ID.
2. **Connections** (each alias in the code is the app's slug):
   - `zapier-tables`: the Zapier Tables connection for the account that owns the table.
   - `gmail`: the Gmail connection that sends the emails.
   - `google-calendar`: the Google Calendar connection that owns the HR calendar.
3. **Constants:**
   - `TABLE_ID`: the Zapier Tables table ID. Use the same ID as the trigger's `table_id`.
   - `HR_CALENDAR_ID`: the calendar ID of the HR calendar (for example, the calendar's email address).
   - `HR_COORDINATOR_EMAIL`: CC'd on the welcome email.
   - `IT_EMAIL`: receives the internal email and is invited to the induction event.
   - `LICENSE_OWNERS_EMAIL`: receives the internal email.
   - `INDUCTION_OFFSET_DAYS` (default `1`) and `INDUCTION_LENGTH_MINUTES` (default `60`): when the event is scheduled and how long it lasts.
4. The table needs these fields, using these keys: `f1` Name (text), `f2` Email (email), `f3` Start Date (date/time), `f4` Induction Link (text), `f5` Hiring Manager Email (email), `f6` Invited At (text). If the table's field order is different, change the `f1`…`f6` constants to match.
5. Test with the steps below, then publish, wait until the trigger is active, and tell the user to check the trigger before relying on it.

## Ask the user

- Which Zapier Tables table holds the new hires, and which fields hold the name, email, start date, induction link, hiring manager email and an Invited At text field?
- Which Google Calendar is the HR calendar?
- Who is the HR coordinator (CC on the welcome email), and who are the IT and license-owner addresses?
- Should the induction event be one day before the start date, and how long should it last?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a test record in a test table, with the email fields set to an address you control (not a real new hire):

```json
{
  "record_id": "YOUR_TEST_RECORD_ID",
  "table_id": "YOUR_TEST_TABLE_ID",
  "new": {
    "id": "YOUR_TEST_RECORD_ID",
    "data": {
      "f1": "Test New Hire",
      "f2": "you@example.com",
      "f3": "2026-11-12T00:00:00Z",
      "f4": "https://example.com/induction",
      "f5": "you@example.com",
      "f6": null
    }
  }
}
```

Confirm that: the welcome email arrived at the test address (with the CC), the internal email arrived at the IT address, one induction event exists on the HR calendar the day before the start date with the new hire's name in its summary, and the record's Invited At field is now set. Then clear Invited At on the test record so it can be run again.

## Customize

- **Task for manual onboarding:** add a step that creates a task in your project board for the manual items on the new hire's checklist.
- **Remote hires or contractors:** add an alternative welcome email template chosen by a field on the record.

## Notes

- The Zapier Tables trigger fires on every update to a record. The Invited At field stops the workflow from sending the emails twice, but it also means that changing the start date on a record that was already invited does not send a new welcome email.
- Dates are formatted in UTC. If your team is in another time zone, the displayed date and the event time can differ by a day near midnight.
- Induction links are plain text in this version. File attachments from the record are not included.
- Never commit a real calendar ID, email address or table ID.
