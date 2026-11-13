---
name: update-support-ticket-when-call-ends-with-details
description: Build a Zap on Zapier that, when a call ends, finds the call's support ticket through a Zapier Tables Calls record and adds the call status, timestamps, recording link and summary to the HubSpot ticket as a note, then deletes the temporary Calls record. Use when a call center or support team logs call-end data from a telephony system and wants tickets enriched without manual lookups.
license: MIT
metadata:
  author: zapier
  summary: "When a call ends, its support ticket gets the call status, times, recording link and a summary note, so coordinators can triage without looking anything up."
  apps: "Webhooks by Zapier, Zapier Tables, HubSpot, Gmail"
  category: "Customer Service & Success"
  job: "Call center operations"
  source: "https://zapier.com/automations/customer-service-success/call-center-operations/post-call-processing/update-support-ticket-when-call-ends-with-details"
---

# Update support ticket when call ends with details

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-support-ticket-when-call-ends-with-details. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a call-end payload arrives at a catch hook (`webhook`, `hook_v2`). The telephony system posts to it.
2. **Zapier Tables** finds the Calls record whose phone number matches the caller's, normalized to digits only.
3. If that record has a HubSpot ticket ID, **HubSpot** looks the ticket up. If there is no record, no ticket ID, or no ticket, **Gmail** sends an alert and the run stops.
4. If the caller's email exactly matches a HubSpot owner, the ticket owner is set to that owner.
5. **HubSpot** updates the ticket: subject, and a description with the call status, start and end times, recording link and summary.
6. **HubSpot** adds the summary to the ticket as a timestamped note.
7. **Zapier Tables** deletes the Calls record, only after the ticket update and note have succeeded.

A run that finds no ticket stops after the alert and leaves the Calls record in place.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting          | What goes there                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------- |
| `CALLS_TABLE_ID` | The Zapier Tables table of temporary call records. Its ID is in the table's URL              |
| `ALERT_EMAIL`    | The address that receives the alert when a call has no ticket. Use an address the user reads |

Also review the defaults with them: `PHONE_FIELD` (`phone`) and `TICKET_REFERENCE_FIELD` (`ticket_reference`) are the Calls table's column names for the normalized phone number and the HubSpot ticket ID. Change them if the table names its columns differently.

Before installing, confirm:

- Which HubSpot account is the ticket system, and is there a test or sandbox account to run the test on?
- Do the telephony system's payload fields match `caller_number`, `call_status`, `started_at`, `ended_at`, `recording_url`, `caller_email` and `call_summary`? If not, rename them in the code before installing.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` (the account that sends the alert) and `hubspot` (the account that owns the tickets; use a test or sandbox account for the test run) to the user's connections. Webhooks by Zapier and Zapier Tables need no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run, on a test HubSpot connection, with a Calls record whose phone number and ticket ID belong to an `[install-test]` ticket:

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

Check that the ticket's subject and description show the call status, times, recording link and summary; that a note with the summary is on the ticket; that the owner changed only if the caller email matches a HubSpot owner exactly; and that the Calls record is gone. For the missing-ticket path, use a phone number with no Calls record and check that the alert arrives at the alert address and that no Calls record was deleted.

If run-status tools aren't available, check the result in HubSpot directly. The user deletes the test data, not the agent.

## Notes

- The Calls record is deleted only when the ticket update and note both succeed, so a failed run keeps the record for a retry.
- There is no caller-name normalization step, because the call-end payload carries no caller name.
- The HubSpot and Zapier Tables field names come from action schemas that show few parameters without a connection, so confirm each one on the first test run.
- To create a ticket when none exists, replace the alert with a HubSpot ticket create and continue with the update. To post the summary to a team channel for manual triage, add a Slack message instead of auto-assigning an owner.
- Keep real table IDs, email addresses and webhook URLs out of any copy you commit.
