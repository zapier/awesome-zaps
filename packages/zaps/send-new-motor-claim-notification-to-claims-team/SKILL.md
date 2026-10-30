---
name: send-new-motor-claim-notification-to-claims-team
description: Build a Zapier Next Gen Zap that emails the claims team a formatted notification whenever a new motor claim is added to a Zapier Table, with dates, expiry alerts and any attachments. Use when a motor insurance or claims business logs claims in a Zapier Table and wants each new one sent to the claims inbox for triage.
metadata:
  author: zapier
  summary: "When a new motor claim lands in your claims table, the claims team gets one email with the claimant's details, formatted dates, any expiry problems and the attachments."
  apps: "Zapier Tables, Microsoft Outlook"
  category: "Business Owners"
  job: "Insurance management"
  source: "https://zapier.com/automations/business-owners/insurance-management/claims-management/send-new-motor-claim-notification-to-claims-team"
---

# Send new motor claim notification to claims team

## What it does

1. **Trigger:** a new record is added to your claims table in Zapier Tables.
2. The workflow checks the vehicle and driving licence expiry dates against the accident date. An expiry on a day before the accident's day raises an alert.
3. **Microsoft Outlook** sends one HTML email to the claims inbox. The subject is `Motor claim: <name>`. The body is a table with the claimant, contact, accident time (DD/MM/YYYY hh:mm A), formatted expiry dates, the alerts and the attachments. Any attachment URLs are attached.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Zapier Tables, New Record (`zapier-tables`, `new_record`). It needs no connection, so `authentication_id` is `null`. Its `table_id` is the claims table.
2. **Connections** (each alias in the code is the app's slug):
   - `microsoft-outlook`: the Outlook account that sends the email. Pick the connection whose title marks it as a test or integration account, else the work account.
3. **Constants** (top of `workflow.ts`):
   - `CLAIMS_TABLE_ID`: the claims table's ID.
   - `CLAIMS_INBOX`: the address that receives each notification. For tests, use the connected Outlook account's own address.
   - `TIME_ZONE`: the IANA time zone for printed dates. Defaults to `UTC`.
   - `NAME_FIELD`, `CONTACT_FIELD`, `VEHICLE_EXPIRY_FIELD`, `DRIVING_EXPIRY_FIELD`, `ACCIDENT_DATETIME_FIELD`, `ATTACHMENTS_FIELD`: the claims table's field keys. Map your column names to these keys.
4. Test with the sample below, then publish, confirm the trigger is active, and point the team at the claims table.

## Ask the user

- Which Zapier Table holds the claims, and what are its field names for the claimant's name, contact, the two expiry dates, the accident date and time, and attachments?
- Which address should receive the notifications? It must be a connected Outlook account for tests.
- Which time zone should dates be printed in? The default is `UTC`.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a `[install-test]` claim record in a test table, and send to the connected Outlook account's own address:

```json
{
  "name": "[install-test] Jane Example",
  "contact": "jane@example.com",
  "vehicle_expiry": "2026-06-30",
  "driving_expiry": "2027-01-15",
  "accident_datetime": "2026-10-20T14:30:00Z",
  "attachments": []
}
```

Confirm that one email arrived with the subject `Motor claim: [install-test] Jane Example`. The vehicle expiry should show as an alert, since 30/06/2026 is before the accident day, and the driving expiry should not. The accident should show as 20/10/2026 02:30 PM. Then delete the test record.

## Customize

- **Issue tracker ticket** for records with an expiry alert: add an action step after the email.
- **SMS or push alert** to the on-call adjuster for high-priority claims: add a step after the email.

## Notes

- The spec asked for every submission field to be passed forward; this zap shows the seven fields in the email table only.
- Outlook downloads attachments only from public URLs, so a table attachment that isn't a URL is skipped.
- Never commit a real claims-table ID, inbox address or connection detail.
