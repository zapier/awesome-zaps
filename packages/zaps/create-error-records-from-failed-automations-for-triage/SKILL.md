---
name: create-error-records-from-failed-automations-for-triage
description: Use when Zap errors should be logged as triage records in an Airtable table, so project managers and automation owners can assign and track each failure. Triggers on phrases like "log Zap errors", "track failed automations", or "create triage records for errors".
metadata:
  author: zapier
  summary: "When one of your Zaps fails, a record is created in your Airtable triage table, or the existing record for that failure is updated, so someone can pick it up."
  apps: "Zapier Manager, Airtable"
  category: "IT"
  job: "Incident response"
  source: "https://zapier.com/automations/it/incident-response/incident-triage/create-error-records-from-failed-automations-for-triage"
---

# Create error records from failed automations for triage

## What it does

1. **Trigger:** Zapier Manager, New Zap Error (`zap_error_alert`) fires when a Zap owned by the account errors.
2. **Airtable Find Record** searches the triage table for a record whose failure link matches the alert's task history link.
3. If a match is found, **Airtable Update Record** sets the title, overwrites the notes with the latest error, and sets the status to the error state.
4. If no match is found, **Airtable Create Record** adds a new record with the title, failure link, error details and status.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Zapier Manager, New Zap Error (`zapier-manager`, `zap_error_alert`). It needs no connection, so its `authentication_id` is `null`. Leave the folder and account fields empty to watch every Zap.
2. **Connections** (each alias in the code is the app's slug):
   - `airtable`: the user's Airtable connection, for the account that owns the triage base.
3. **Constants:**
   - `BASE_ID`: the Airtable base ID, starting with `app`.
   - `TABLE_NAME`: the table that holds error records.
   - `FAILURE_LINK_FIELD`, `TITLE_FIELD`, `ERROR_DETAILS_FIELD`, `NOTES_FIELD`, `STATUS_FIELD`: the field names in that table.
   - `ERROR_STATUS`: the status to write, default `"Error"`.
4. Test with the steps below, then publish, wait until the trigger is active, and leave it on.

## Ask the user

- Which Airtable base and table hold the triage records, and what are their field names for title, failure link, error details, notes and status?
- Which status value means an error needs triage? Default: `Error`.
- Should a Zap's owner be recorded as reporter? The trigger payload has no reporter email, so this version leaves that field out.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use an Airtable base and table that are safe to write to, such as a test base.

```json
{
  "title": "My Awesome Zap",
  "task_history_link": "https://zapier.com/app/history?root_id=1&source=zapier_manager",
  "zap_link": "https://zapier.com/app/editor/1?source=zapier_manager",
  "service": "Code by Zapier",
  "message": "Error: Boom!"
}
```

Run it twice. The first run should create one record with the title, failure link, error details and status set. The second run should update that same record, not create another. Check both by reading the table back. Then tell the user to delete the test record if it was real data.

## Customize

- **Notify an owner** for high-severity failures: add a Slack or email step after the create or update.
- **Auto-assign by severity** to on-call owners: set an owner field based on the service or message.

## Notes

- The trigger fires for every failed Zap on the account. Narrow it with the folder or Zap fields if most failures are noise.
- Matching is on the failure link, so each distinct failure gets one record, and repeats update its notes.
- Never commit a real base ID or table name. Anyone who can see them can see your triage records.
