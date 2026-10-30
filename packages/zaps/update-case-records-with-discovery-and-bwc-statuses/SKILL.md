---
name: update-case-records-with-discovery-and-bwc-statuses
description: Build a Zapier Next Gen Zap that takes an evidence intake webhook for an e-discovery case and updates the matching Airtable case record with its Discovery and BWC statuses, timestamps and activity log, plus one KPI entry per track. Use when a litigation support team tracks discovery and body-worn camera (BWC) production status in Airtable and wants intake updates logged without manual edits.
metadata:
  author: zapier
  summary: "When an evidence intake update arrives, the matching case record in Airtable gets its Discovery and BWC statuses, timestamps and activity log, and a KPI entry is logged for each track."
  apps: "Webhooks by Zapier, Airtable"
  category: "Legal"
  job: "E discovery litigation support"
  source: "https://zapier.com/automations/legal/e-discovery-litigation-support/litigation-timeline-tracking/update-case-records-with-discovery-and-bwc-statuses"
---

# Update case records with discovery and BWC statuses

## What it does

1. **Trigger:** an evidence intake payload arrives at a Webhooks by Zapier catch hook (an intake form, script or case tool posts to it).
2. **Airtable** finds the case record whose Record ID matches `record_id` in the payload. If there is no match, the run stops and writes nothing.
3. The payload's status, user, note and timestamp are normalized in plain code. A verification flag is set, and the case's activity log is extended with a new line rather than overwritten.
4. **Airtable** creates one KPI entry for Discovery and one for BWC in the KPI tracking table, each with the track's status, the verification flag, the timestamp and the note.
5. **Airtable** updates the case record: the matching track's status and updated time, the verification flag, and the appended activity log.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first run. Airtable's Base, Table and field inputs are read from the account, so they can only be checked once the connection is authorized.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top of the file; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `airtable`: the user's Airtable connection, for the account that owns the case and KPI bases.
3. **Constants:**
   - `BASE_ID`: the Airtable base that holds both tables (starts with `app`).
   - `CASE_TABLE`: the table of cases, matched by Record ID and updated.
   - `KPI_TABLE`: the KPI tracking table that receives one entry per track.
   - `CASE_FIELDS` and `KPI_FIELDS`: the field names in those two tables. Map them to the user's column headers.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point their intake system at.

## Ask the user

- Which Airtable base and tables hold the cases and the KPI log? Which fields hold the case's Discovery status, BWC status, the two updated times, the verification flag and the activity log?
- What does the intake system send as the case's identifier? The payload must carry it as `record_id`. If it uses another field name, change the schema before installing.
- Which fields in the payload carry the statuses, the user, the note, the timestamp and the verification flag? The code reads `discovery_status`, `bwc_status`, `user`, `note`, `timestamp` and `verified`. If the sender uses other names, rename them in the schema.
- Should a KPI entry be written for a track only when its status changed? The default writes both on every matched update.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, with a Record ID that exists in the user's case table:

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

Confirm that the matching case row changed: the two statuses are set, both updated times show the timestamp, the verification flag is set, and a new line is appended to the activity log. Confirm that two new KPI rows exist, one for Discovery and one for BWC, each with the note and timestamp. Then tell the user to remove the test rows if they were real data.

Also run a sample with a Record ID that does not exist and check that nothing is written.

## Customize

- **Log changed statuses only:** write a KPI entry only when a track's status differs from the case's current value, to reduce noise.

## Notes

- Airtable may show the timestamp in the field's own format and time zone.
- If two cases share a Record ID, only the first is matched. Record IDs are unique within a table, so this should not happen.
- The activity log is appended, so the existing history is kept. Long logs can reach Airtable's field size limit; move older lines to an archive field if that happens.
- Never commit a real base ID, table ID or webhook URL. Anyone with the webhook URL can write case updates.
