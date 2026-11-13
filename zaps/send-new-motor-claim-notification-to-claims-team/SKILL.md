---
name: send-new-motor-claim-notification-to-claims-team
description: Build a Zap on Zapier that emails the claims team a formatted notification whenever a new motor claim is added to a Zapier Table, with dates, expiry alerts and any attachments. Use when a motor insurance or claims business logs claims in a Zapier Table and wants each new one sent to the claims inbox for triage.
license: MIT
metadata:
  author: zapier
  summary: "When a new motor claim lands in your claims table, the claims team gets one email with the claimant's details, formatted dates, any expiry problems and the attachments."
  apps: "Zapier Tables, Microsoft Outlook"
  category: "Business Owners"
  job: "Insurance management"
  source: "https://zapier.com/automations/business-owners/insurance-management/claims-management/send-new-motor-claim-notification-to-claims-team"
---

# Send new motor claim notification to claims team

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-new-motor-claim-notification-to-claims-team. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new record is added to your claims table in Zapier Tables (`zapier-tables`, `new_record`).
2. The workflow checks the vehicle and driving licence expiry dates against the accident date. An expiry on a day before the accident's day raises an alert.
3. **Microsoft Outlook** sends one HTML email to the claims inbox. The subject is `Motor claim: <name>`. The body is a table with the claimant, contact, accident time (DD/MM/YYYY hh:mm A), formatted expiry dates, the alerts and the attachments. Any attachment URLs are attached.

The Zap only sends the email. It never edits the claim record.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting           | What goes there                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `CLAIMS_TABLE_ID` | The Zapier Table that holds the motor claims. This is the trigger's table; look it up with the user's Zapier Tables connection |
| `CLAIMS_INBOX`    | The address that receives each notification. For tests, use the connected Outlook account's own address                        |

Also review the defaults with them: `TIME_ZONE` (an IANA time zone for printed dates, `UTC` by default) and the field keys `NAME_FIELD`, `CONTACT_FIELD`, `VEHICLE_EXPIRY_FIELD`, `DRIVING_EXPIRY_FIELD`, `ACCIDENT_DATETIME_FIELD` and `ATTACHMENTS_FIELD`. If the table's columns are named differently, set each key to its column.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `microsoft-outlook` to the Outlook account that sends the email. Pick the connection whose title marks it as a test or integration account, else the work account. Zapier Tables needs no connection, so the trigger's `authentication_id` is `null`.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-record.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's table to `CLAIMS_TABLE_ID`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test run before publishing. Use a `[install-test]` claim record in a test table, and send to the connected Outlook account's own address:

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

Confirm that one email arrived with the subject `Motor claim: [install-test] Jane Example`. The vehicle expiry should show as an alert, since 30/06/2026 is before the accident day, and the driving expiry should not. The accident should show as 20/10/2026 02:30 PM. If run-status tools aren't available, check the result in Outlook directly. Then publish, confirm the trigger is active, and ask the user to delete the test record. The user deletes test data, not the agent.

## Notes

- The email shows seven fields only, not every field on the record.
- Outlook downloads attachments only from public URLs, so a table attachment that isn't a URL is skipped.
- To extend it, add a step after the email: an issue tracker ticket for records with an expiry alert, or an SMS or push alert to the on-call adjuster for high-priority claims.
- Never commit a real claims-table ID, inbox address or connection detail.
