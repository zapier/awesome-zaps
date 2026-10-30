---
name: update-support-ticket-when-call-ends-with-details
description: Build a Zapier Next Gen Zap that, when a call ends, finds the call's support ticket through a Zapier Tables Calls record and adds the call status, timestamps, recording link and summary to the HubSpot ticket as a note, then deletes the temporary Calls record. Use when a call center or support team logs call-end data from a telephony system and wants tickets enriched without manual lookups.
metadata:
  author: zapier
  summary: "When a call ends, its support ticket gets the call status, times, recording link and a note, so coordinators can triage without looking anything up."
  apps: "Webhooks by Zapier, Zapier Tables, HubSpot, Gmail"
  category: "Customer Service & Success"
  job: "Call center operations"
  source: "https://zapier.com/automations/customer-service-success/call-center-operations/post-call-processing/update-support-ticket-when-call-ends-with-details"
---

# Update support ticket when call ends with details

## What it does

1. **Trigger:** a call-end payload arrives at a Webhooks by Zapier catch hook (the telephony system posts to it).
2. **Zapier Tables** finds the Calls record whose phone number matches the caller's, normalized to digits only.
3. If that record has a HubSpot ticket ID, **HubSpot** looks the ticket up. If there is no record, no ticket ID, or no ticket, **Gmail** sends an alert and the run stops. The Calls record is kept.
4. If the caller's email exactly matches a HubSpot owner, the ticket owner is set to that owner.
5. **HubSpot** updates the ticket: subject, and a description with the call status, start and end times, recording link and summary.
6. **HubSpot** adds the summary to the ticket as a timestamped note.
7. **Zapier Tables** deletes the Calls record, only after the ticket update and note have succeeded.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook` / `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the Gmail account that sends the alert.
   - `hubspot`: the HubSpot account that owns the tickets. Use a test or sandbox account for any test run.
   - Zapier Tables (`zapier-tables`) has no connection; it works on the account's own tables.
3. **Constants:**
   - `CALLS_TABLE_ID`: the Zapier Tables table of temporary call records.
   - `PHONE_FIELD` and `TICKET_REFERENCE_FIELD`: the Calls table's column names for the phone number and the HubSpot ticket ID.
   - `ALERT_EMAIL`: where the no-ticket alert goes.

## Ask the user

- Which Zapier Tables table holds the Calls records, and which columns hold the phone number and the HubSpot ticket ID?
- Which HubSpot account is the ticket system, and is there a test or sandbox account to run the test on?
- What address should receive the no-ticket alert?
- Do the telephony system's payload fields match `caller_number`, `call_status`, `started_at`, `ended_at`, `recording_url`, `caller_email` and `call_summary`? If not, rename them in the code before installing.

## Test

Before publishing, run this sample as a draft test run (`run_workflow_draft`), on a test HubSpot connection, with a Calls record whose phone number and ticket ID belong to a `[install-test]` ticket:

```json
{
  "caller_number": "+15555550123",
  "call_status": "completed",
  "started_at": "2026-10-29T10:00:00Z",
  "ended_at": "2026-10-29T10:07:30Z",
  "recording_url": "https://example.com/recordings/test-call.mp3",
  "caller_email": "caller@example.com",
  "call_summary": "[install-test] Customer asked about a delayed order. Agent confirmed the new date."
}
```

Check: the ticket's subject and description show the call status, times, recording link and summary; a note with the summary is on the ticket; the owner changed only if the caller email matches a HubSpot owner exactly; the Calls record is gone. For the missing-ticket path, use a phone number with no Calls record and check that the alert arrives at the alert address and that no Calls record was deleted.

## Customize

- **Create a new ticket when none exists:** instead of sending the alert, create a HubSpot ticket and continue with the update.
- **Post to a team channel for manual triage:** add a Slack message for the summary instead of auto-assigning an owner.

## Notes

- The Calls record is deleted only when the ticket update and note both succeed, so a failed run keeps the record for a retry.
- The spec's Formatter step that normalizes caller names is not built: the call-end payload has no caller name.
- The HubSpot and Zapier Tables field names were read from action schemas that show few parameters without a connection. Confirm each one on the first test run.
- Never commit a real spreadsheet, table, email address or webhook URL to this folder.
