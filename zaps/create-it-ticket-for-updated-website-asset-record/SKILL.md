---
name: create-it-ticket-for-updated-website-asset-record
description: Build a Zap on Zapier that creates an IT ticket in Airtable when a website asset row is created or updated, skipping assets that already have a ticket. Use when a team tracks website assets in Airtable and wants engineers to get a ticket with the asset's context as soon as the record changes.
license: MIT
metadata:
  author: zapier
  summary: "When a website asset record changes, an IT ticket is created for it with the asset's details, so engineers can act right away."
  apps: "Airtable"
  category: "IT"
  job: "IT service management"
  source: "https://zapier.com/automations/it/it-service-management/it-ticketing/create-it-ticket-for-updated-website-asset-record"
---

# Create IT ticket for updated website asset record

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-it-ticket-for-updated-website-asset-record. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** Airtable's "New or Updated Record" fires when a record in the website asset table is created or changed.
2. **Airtable** looks for an existing ticket in the IT tickets table with the same Asset ID. If one exists, the run stops and nothing is created.
3. **Airtable** creates a ticket: title from the asset's title and submitter, start date from the asset's date, the asset link in the description, priority from the asset (`High` or `Critical` only, otherwise `Medium`), and status `Open`.
4. **Airtable** (optional) writes the new ticket's record ID back to the asset row, so the asset shows its ticket.

The Zap only creates tickets. If an asset changes after its ticket exists, the existing ticket is left as it is.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                        | What goes there                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| `REPLACE_BASE_ID`              | The Airtable base that holds the asset and IT tickets tables                          |
| `REPLACE_ASSET_TABLE`          | The table of website assets. The trigger watches it for new or updated records        |
| `REPLACE_ASSET_MODIFIED_FIELD` | The asset table's last-modified-time column, which the trigger uses to detect updates |
| `REPLACE_TICKETS_TABLE`        | The table where IT tickets are created                                                |

Also review the defaults with them: the `ASSET_*` and `TICKET_*` column names in `config.ts` must match their two tables exactly, including case. `ASSET_TICKET_LINK_FIELD` is the asset column that receives the ticket link, and `LINK_TICKET_ON_ASSET` in `workflow.ts` turns that link-back step on or off. `INITIAL_STATUS` is the status for new tickets, and `DEFAULT_PRIORITY` is the priority used unless the asset is flagged `High` or `Critical`. Ask whether any priorities besides those two should override the default.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `airtable` to the user's Airtable connection for the account that owns both tables.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-record.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger watches the asset table: set its base to `BASE_ID`, its table to `ASSET_TABLE`, and its `filterByField` to `ASSET_MODIFIED_FIELD`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connection and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test (`run_workflow_draft`) with a test asset row in a copy of the tables, not live data:

```json
{
  "id": "recTESTASSET0001",
  "Asset ID": "WEB-0001",
  "Title": "Homepage hero image broken",
  "Submitter": "Test User",
  "Date": "2026-10-29",
  "Asset link": "https://airtable.com/<base-id>/<asset-table>/recTESTASSET0001",
  "Priority": "High"
}
```

Check that one new ticket appears in the IT tickets table with the title, date, description, `High` priority and `Open` status. Run it again with the same Asset ID and check that no second ticket is created. Check that the asset row's ticket link was written. If run-status tools aren't available, check the result in Airtable directly. Ask the user to delete the test rows; the agent doesn't delete them.

## Notes

- Writing the ticket link to the asset row fires the trigger again. The existing-ticket check stops a second ticket from being created, but the run still happens. Set `LINK_TICKET_ON_ASSET` to `false` if that extra run is a problem.
- To notify assignees, add a Slack or email step after the ticket is created. To choose ticket fields by department or priority, branch on the asset's department or priority before the create step.
- Anyone with access to the workflow can see the field mapping, so keep real base and table IDs out of public repositories.
