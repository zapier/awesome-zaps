---
name: create-call-logs-and-email-recording-link-to-owner
description: Build a Zap on Zapier that logs each completed phone call as a row in a Google Sheets call log and emails the call's recording link to the owner. Use when a call center or support team wants every finished call recorded in a sheet, with the recording link sent to the person responsible for it, without manual entry.
license: MIT
metadata:
  author: zapier
  summary: "Every finished call is logged as a row in your call sheet, with its timing and recording link, and the owner gets the recording link by email."
  apps: "Webhooks by Zapier, Google Sheets, Gmail"
  category: "Customer Service & Success"
  job: "Call center operations"
  source: "https://zapier.com/automations/customer-service-success/call-center-operations/post-call-processing/create-call-logs-and-email-recording-link-to-owner"
---

# Create call logs and email recording link to owner

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-call-logs-and-email-recording-link-to-owner. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a completed call's event arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). The telephony system posts to it.
2. **Filter:** if the event has no end time, the run stops and writes nothing. Only finished calls are logged.
3. **Timing:** computes the call's duration in seconds from the start and end times.
4. **Google Sheets** appends one row to the call log: call reference, session ID, call type, agent ID, start, end, duration, recording link and status (`Completed`).
5. **Gmail** emails the owner the recording link, with the call reference and start time in the subject and body. This step runs only when the payload includes a recording URL.

The Zap only appends rows and sends the owner's recording emails. It never edits or deletes existing rows.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting          | What goes there                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| `SPREADSHEET_ID` | The call-log spreadsheet: look up its ID with the user's Google Sheets connection                  |
| `OWNER_EMAIL`    | The address that receives the recording link. It must be the connected Gmail account's own address |

Also review the defaults with them: `WORKSHEET_ID` (`"0"` is the first tab), `COMPLETED_STATUS` (`"Completed"`), and `COLUMNS` (column keys such as `COL$A`, not header names; map each field to the sheet's column letters).

Before installing, confirm:

- The call-log tab has at least nine columns, in this order: call reference, session ID, call type, agent ID, start, end, duration, recording link, status.
- The telephony system sends the fields `InputSchema` reads: `call_reference`, `session_id`, `call_type`, `agent_id`, `started_at`, `ended_at`, `end_reason` and `recording_url`. If the names differ, rename them in `InputSchema`.
- One fixed owner address is right. The Zap sends every recording link to it. If owners differ by agent, a lookup by agent ID is needed first.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` (the account that owns the call-log sheet) and `gmail` (sends the email; the owner address must be this account's own address) to the user's connections. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections, and sample the trigger, before the first test run. Fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test before publishing. The call reference and session ID start with `[install-test]` so the test rows are easy to find:

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

Check that one new row is in the call log with the call reference, duration `330`, the recording link and status `Completed`, and that the owner received one email whose subject starts with `Call recording: [install-test] CA-001` and whose body contains the recording link. If run-status tools aren't available, check the result in Google Sheets and Gmail directly. Then publish, confirm the trigger is active, and give the user their webhook URL to point the telephony system at. The user deletes the test row and test email, not the agent.

## Notes

- The email step runs only when `recording_url` is present. A call with no recording is logged but not emailed.
- Google Sheets may show the timestamp in the sheet's own format and time zone.
- Anyone with the webhook URL can add rows to the call log and send emails, so keep it private.
- To notify only for long calls, add a duration check before the email step, using the duration from `compute-call-duration`.
- To route to Slack or a ticket, replace the email step with a Slack message or ticket creation step.
- Never commit a real spreadsheet ID, owner email or webhook URL.
