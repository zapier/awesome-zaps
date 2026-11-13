---
name: create-error-records-from-failed-automations-for-triage
description: Build a Zap on Zapier that logs Zap errors as triage records in an Airtable table, so project managers and automation owners can assign and track each failure. Use when Zap errors should be logged as triage records in an Airtable table. Triggers on phrases like "log Zap errors", "track failed automations", or "create triage records for errors".
license: MIT
metadata:
  author: zapier
  summary: "When one of your Zaps fails, a record is created in your Airtable triage table, or the existing record for that failure is updated, so someone can pick it up."
  apps: "Zapier Manager, Airtable"
  category: "IT"
  job: "Incident response"
  source: "https://zapier.com/automations/it/incident-response/incident-triage/create-error-records-from-failed-automations-for-triage"
---

# Create error records from failed automations for triage

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-error-records-from-failed-automations-for-triage. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Zap owned by the account errors (`zapier-manager`, `zap_error_alert`). The alert brings the Zap's title, its task history link, the app and the error message.
2. **Airtable** searches the triage table for a record whose failure link matches the alert's task history link.
3. If a match is found, **Airtable** updates that record: it sets the title, overwrites the notes with the latest error, and sets the status to the error state.
4. If no match is found, **Airtable** creates a record with the title, failure link, error details and status.

Each distinct failure gets one record. A repeat of the same failure updates that record's notes instead of adding another.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting      | What goes there                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `BASE_ID`    | The Airtable base that holds the triage table; find it with the user's Airtable connection       |
| `TABLE_NAME` | The table in that base where error records are kept; find it with the user's Airtable connection |

Also review the defaults with them:

- The field names in `config.ts` (`FAILURE_LINK_FIELD`, `TITLE_FIELD`, `ERROR_DETAILS_FIELD`, `NOTES_FIELD`, `STATUS_FIELD`). They must match the table's field names exactly.
- `ERROR_STATUS`, the status value that means a failure needs triage. Default: `"Error"`.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `airtable` to the user's Airtable connection for the account that owns the triage base. `zapier-manager` is the trigger's app; the trigger needs no connection, so its `authentication_id` is `null`.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/zap-error-alert.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test before publishing, against an Airtable base and table that are safe to write to, such as a test base:

```json
{
  "title": "My Awesome Zap",
  "task_history_link": "https://zapier.com/app/history?root_id=1&source=zapier_manager",
  "zap_link": "https://zapier.com/app/editor/1?source=zapier_manager",
  "service": "Code by Zapier",
  "message": "Error: Boom!"
}
```

Run it twice. The first run should create one record with the title, failure link, error details and status set. The second run should update that same record, not create another. Check both by reading the table back. If run-status tools aren't available, check the result in Airtable directly. Ask the user to delete the test records; the agent doesn't delete them. Then publish, confirm the trigger is active, and leave it on.

## Notes

- The trigger fires for every failed Zap on the account. Narrow it with the folder or Zap fields if most failures are noise.
- Matching is on the failure link, so repeats of a failure update one record's notes.
- To notify an owner for high-severity failures, add a Slack or email step after the create or update. To assign owners by severity, set an owner field from the service or message.
- Don't share a copy of this Zap with a real base ID or table name filled in. Anyone who can see them can see your triage records.
