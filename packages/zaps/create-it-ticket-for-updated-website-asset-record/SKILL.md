---
name: create-it-ticket-for-updated-website-asset-record
description: Build a Zapier Next Gen Zap that creates an IT ticket in Airtable when a website asset row is created or updated, skipping assets that already have a ticket. Use when a team tracks website assets in Airtable and wants engineers to get a ticket with the asset's context as soon as the record changes.
metadata:
  author: zapier
  summary: "When a website asset record changes, an IT ticket is created for it with the asset's details, so engineers can act right away."
  apps: "Airtable"
  category: "IT"
  job: "IT service management"
  source: "https://zapier.com/automations/it/it-service-management/it-ticketing/create-it-ticket-for-updated-website-asset-record"
---

# Create IT ticket for updated website asset record

## What it does

1. **Trigger:** Airtable's "New or Updated Record" fires when a record in the website asset table is created or changed.
2. **Airtable** looks for an existing ticket in the IT tickets table with the same Asset ID. If one exists, the run stops and nothing is created.
3. **Airtable** creates a ticket: title from the asset's title and submitter, start date from the asset's date, the asset link in the description, priority from the asset (`High` or `Critical` only, otherwise `Medium`), and status `Open`.
4. **Airtable** (optional) writes the new ticket's record ID back to the asset row, so the asset shows its ticket.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top.

1. **Trigger:** Airtable, New or Updated Record (`airtable`, `updated_record`). Set `applicationId` to the base, `tableName` to the asset table, and `filterByField` to the table's last-modified-time column.
2. **Connections** (each alias in the code is the app's slug):
   - `airtable`: the user's Airtable connection, for the account that owns both tables.
3. **Constants:**
   - `BASE_ID`, `ASSET_TABLE`, `ASSET_MODIFIED_FIELD`, `TICKETS_TABLE`: the base and table IDs or names.
   - `ASSET_*` and `TICKET_*` field names: the column names in the user's two tables. Match them exactly, including case.
   - `ASSET_TICKET_LINK_FIELD` and `LINK_TICKET_ON_ASSET`: the column that receives the ticket link, and whether to write it.
   - `INITIAL_STATUS`, `DEFAULT_PRIORITY`: the ticket status for new tickets and the priority used by default.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the editor link.

## Ask the user

- Which base holds the asset table and the IT tickets table? Which table is each?
- Which asset column holds the unique asset ID, the title, the submitter, the date, the asset link and the priority? Which column is the last-modified-time field the trigger should watch?
- Which column in the asset table should receive the ticket link, or should the link-back step be turned off?
- What status should a new ticket get? Which priorities besides `High` and `Critical` should override the default?

## Test

Run as a draft test run (`run_workflow_draft`) before publishing. Use a test asset row in a copy of the tables, not live data:

```json
{
  "id": "recTESTASSET0001",
  "Asset ID": "WEB-0001",
  "Title": "Homepage hero image broken",
  "Submitter": "Test User",
  "Date": "2026-10-29",
  "Asset link": "https://airtable.com/YOUR_BASE_ID/YOUR_ASSET_TABLE_NAME/recTESTASSET0001",
  "Priority": "High"
}
```

Check that one new ticket appears in the IT tickets table with the title, date, description, `High` priority and `Open` status. Run it again with the same Asset ID and check that no second ticket is created. Check that the asset row's ticket link was written. Then delete the test rows.

_Not yet run._ The sample above is the intended test input. The payload shape is not confirmed, because no sample was read from the trigger.

## Customize

- **Notify assignees:** add a Slack or email step after the ticket is created, to tell the team about the new ticket.
- **Ticket templates by department or priority:** choose the ticket's fields from the asset's department or priority, using different templates for different cases.

## Notes

- Updating the asset row to write the ticket link fires the trigger again. The existing-ticket check stops a second ticket from being created, but the run still happens. Turn off `LINK_TICKET_ON_ASSET` if that extra run is a problem.
- The workflow only creates tickets. If an asset changes after its ticket exists, the existing ticket is left as it is.
- Never commit a real base ID, table ID or spreadsheet link. Anyone with access to the workflow can see the field mapping.
