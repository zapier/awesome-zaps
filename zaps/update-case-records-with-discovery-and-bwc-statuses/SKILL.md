---
name: update-case-records-with-discovery-and-bwc-statuses
description: Build a Zap on Zapier that takes an evidence intake webhook for an e-discovery case and updates the matching Airtable case record with its Discovery and BWC statuses, timestamps and activity log, plus one KPI entry per track. Use when a litigation support team tracks discovery and body-worn camera (BWC) production status in Airtable and wants intake updates logged without manual edits.
license: MIT
metadata:
  author: zapier
  summary: "When an evidence intake update arrives, the matching case record in Airtable gets its Discovery and BWC statuses, timestamps and activity log, and a KPI entry is logged for each track."
  apps: "Webhooks by Zapier, Airtable"
  category: "Legal"
  job: "E discovery litigation support"
  source: "https://zapier.com/automations/legal/e-discovery-litigation-support/litigation-timeline-tracking/update-case-records-with-discovery-and-bwc-statuses"
---

# Update case records with discovery and BWC statuses

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-case-records-with-discovery-and-bwc-statuses. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** an evidence intake payload arrives at a catch hook in `webhook` (Webhooks by Zapier). An intake form, script or case tool posts to it.
2. **Airtable** finds the case record whose Record ID matches `record_id` in the payload. If there is no match, the run stops and writes nothing.
3. The payload's status, user, note and timestamp are normalized in plain code. A verification flag is set, and the case's activity log is extended with a new line rather than overwritten.
4. **Airtable** creates one KPI entry for Discovery and one for BWC in the KPI tracking table, each with the track's status, the verification flag, the timestamp and the note.
5. **Airtable** updates the case record: the matching track's status and updated time, the verification flag, and the appended activity log.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting      | What goes there                                                                |
| ------------ | ------------------------------------------------------------------------------ |
| `BASE_ID`    | The Airtable base that holds the case and KPI tables. Its ID starts with `app` |
| `CASE_TABLE` | The table of cases, matched by Record ID and updated                           |
| `KPI_TABLE`  | The KPI tracking table that receives one entry per track                       |

Defaults to review with them:

- `CASE_FIELDS` and `KPI_FIELDS` in `workflow.ts` hold the field names in those two tables. Map them to the user's column headers: the case's Discovery status, BWC status, the two updated times, the verification flag and the activity log.
- The intake system must send the case's identifier as `record_id`. The code also reads `discovery_status`, `bwc_status`, `user`, `note`, `timestamp` and `verified`. If the sender uses other names, rename them in the schema before installing.
- The default writes a KPI entry for both tracks on every matched update. Ask whether they want entries only when a track's status changed (see Notes).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `airtable` to the user's Airtable connection for the account that owns the case and KPI bases. `webhook` needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger needs no connection, so its `authentication_id` is `null`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's Airtable connection before the first test run, and fix any key in `workflow.ts` that doesn't match. Airtable's base and table inputs can only be checked once the connection is authorized.

Once published and the trigger is active, give the user their webhook URL to point their intake system at.

## Test it

Run this sample as a draft test (`run_workflow_draft` in Zapier MCP) before publishing, with a Record ID from the user's case table:

```json
{
  "record_id": "recEXAMPLE123",
  "discovery_status": "Produced",
  "bwc_status": "Received",
  "user": "Jane Doe",
  "note": "Discovery set produced; BWC files received",
  "timestamp": "2026-10-29T10:15:00Z",
  "verified": true
}
```

Check that the matching case row changed: both statuses are set, both updated times show the timestamp, the verification flag is set, and a new line is appended to the activity log. Check that two new KPI rows exist, one for Discovery and one for BWC, each with the note and timestamp. Also run a sample with a Record ID that does not exist and check that nothing is written.

If run-status tools aren't available, check the result in Airtable directly. The user deletes any test data, not the agent.

## Notes

- **Log changed statuses only:** to cut noise, write a KPI entry only when a track's status differs from the case's current value.
- Airtable may show the timestamp in the field's own format and time zone.
- If two cases share a Record ID, only the first is matched. Record IDs are unique within a table, so this should not happen.
- The activity log is appended, so existing history is kept. Long logs can reach Airtable's field size limit; move older lines to an archive field if that happens.
- Never commit a real base ID, table ID or webhook URL. Anyone with the webhook URL can write case updates.
