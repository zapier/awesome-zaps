---
name: create-call-logs-and-email-recording-link-to-owner
description: Build a Zapier Next Gen Zap that logs each completed phone call as a row in a Google Sheets call log and emails the call's recording link to the owner. Use when a call center or support team wants every finished call recorded in a sheet, with the recording link sent to the person responsible for it, without manual entry.
metadata:
  author: zapier
  summary: "Every finished call is logged as a row in your call sheet, with its timing and recording link, and the owner gets the recording link by email."
  apps: "Webhooks by Zapier, Google Sheets, Gmail"
  category: "Customer Service & Success"
  job: "Call center operations"
  source: "https://zapier.com/automations/customer-service-success/call-center-operations/post-call-processing/create-call-logs-and-email-recording-link-to-owner"
---

# Create call logs and email recording link to owner

## What it does

1. **Trigger:** a completed call's event arrives at a Webhooks by Zapier catch hook (the telephony system posts to it).
2. **Filter:** if the event has no end time, the run stops and writes nothing. Only finished calls are logged.
3. **Timing:** computes the call's duration in seconds from the start and end times.
4. **Google Sheets** appends one row to the call log: call reference, session ID, call type, agent ID, start, end, duration, recording link and status (`Completed`).
5. **Gmail** emails the owner the recording link, with the call reference and start time in the subject and body. This step runs only when the payload includes a recording URL.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the Google Sheets connection for the account that owns the call-log sheet.
   - `gmail`: the Gmail connection that sends the email. The owner address must be this account's own address.
3. **Constants:**
   - `SPREADSHEET_ID`: the long ID in the call-log sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `OWNER_EMAIL`: the address that receives the recording link.
   - `COLUMNS`: column keys such as `COL$A`, not header names. Map the sheet's headers to their column letters. The sheet needs at least nine columns in this order: call reference, session ID, call type, agent ID, start, end, duration, recording link, status.
   - `COMPLETED_STATUS`: the status written to each row. Defaults to `"Completed"`.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point the telephony system at.

## Ask the user

- Which sheet and tab is the call log, and which columns hold each field? The code writes nine columns, in the order above.
- Who is the owner? The code sends every recording link to one fixed address. If owners differ by agent, a lookup by agent ID is needed before this is installed.
- What does the telephony system send? The code reads `call_reference`, `session_id`, `call_type`, `agent_id`, `started_at`, `ended_at`, `end_reason` and `recording_url`. If the field names differ, rename them in `InputSchema` before installing.
- Should the status read something other than `Completed`?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. The call reference and session ID start with `[install-test]` so the test rows are easy to find:

```json
{
  "call_reference": "[install-test] CA-001",
  "session_id": "[install-test] SES-001",
  "call_type": "inbound",
  "agent_id": "agent-42",
  "started_at": "2026-10-29T10:00:00Z",
  "ended_at": "2026-10-29T10:05:30Z",
  "end_reason": "completed",
  "recording_url": "https://example.com/recordings/install-test-ca-001.mp3"
}
```

Check that: one new row is in the call log with the call reference, duration `330`, the recording link and status `Completed`; and the owner received one email whose subject starts with `Call recording: [install-test] CA-001` and whose body contains the recording link. Then delete the test row and the test email if they were real data.

## Customize

- **Only notify for long calls:** add a duration check before the email step, using the duration computed in `compute-call-duration`.
- **Route to Slack or a ticket:** replace the email step with a Slack message or ticket creation step for team routing.

## Notes

- Google Sheets may show the timestamp in the sheet's own format and time zone.
- The email step runs only when `recording_url` is present. A call with no recording is logged but not emailed.
- Anyone with the webhook URL can add rows to the call log and send emails, so keep it private.
- Never commit a real spreadsheet ID, owner email or webhook URL.
