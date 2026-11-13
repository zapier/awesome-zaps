---
name: create-claims-database-entry-from-updated-sheet-rows
description: Build a Zap on Zapier that copies each updated row of an insurance claims sheet into a Zapier Table as a claim record, once per claim ID, with a link back to the row. Use when a claims or intake team tracks claims in Google Sheets and wants a structured, deduplicated claims database in Zapier Tables without manual copying.
license: MIT
metadata:
  author: zapier
  summary: "When a claim row in your sheet is updated, a matching claim record is added to your Zapier Table, with a link back to the row, so triage works from one clean list."
  apps: "Google Sheets, Zapier Tables"
  category: "Business Owners"
  job: "Insurance management"
  source: "https://zapier.com/automations/business-owners/insurance-management/claims-management/create-claims-database-entry-from-updated-sheet-rows"
---

# Create claims database entry from updated sheet rows

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-claims-database-entry-from-updated-sheet-rows. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a row in your claims sheet is updated (`google-sheets`, `updated_row_only`, "Updated Spreadsheet Row").
2. **Filter:** if the row has no Claim ID, the run stops and writes nothing.
3. **Zapier Tables** looks for a record whose Claim ID matches. If one exists, the run stops: the claim is already in the table.
4. **Zapier Tables** creates a record with the claim ID, claimant name, policy number, claim amount, status, received-at time, and a link to the sheet row.

The Zap only skips duplicates. It never updates or deletes a claim record that already exists.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting           | Where       | What goes there                                                            |
| ----------------- | ----------- | -------------------------------------------------------------------------- |
| `SPREADSHEET_ID`  | `config.ts` | The claims spreadsheet, looked up from the user's Google Sheets connection |
| `CLAIMS_TABLE_ID` | `config.ts` | The Zapier Table that receives the claims, taken from its URL              |

Also review the defaults with them: `WORKSHEET_ID` (`"0"` is the first tab), `REFERENCE_FIELD` (`"f1"` is the table's first field, which holds the claim ID), and the column keys `COL$A` to `COL$F` in `config.ts`. Ask which columns hold the claim ID, claimant name, policy number, claim amount, status and received time, and map each to its column letter.

The table needs seven fields in this order: Claim ID (text), Claimant Name (text), Policy Number (text), Claim Amount (number), Status (text), Received At (date and time), Sheet Row Link (text). If the user doesn't have it yet, build it first, then use its ID.

Also confirm:

- Should brand-new rows also create records? The trigger only fires when an existing row is updated. If yes, switch it to "New or Updated Spreadsheet Row" (`updated_row_notify_hook`) and check it fires as expected.
- What time zone is the "Received At" column in? Zapier Tables reads the text as a time in the account's time zone, so a sheet in another zone will show shifted times.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` to the user's Google Sheets connection, for the account that owns the claims sheet. The trigger uses it. Zapier Tables (`zapier-tables`) needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-row-only.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. Set the trigger's `spreadsheet` and `worksheet` to `SPREADSHEET_ID` and `WORKSHEET_ID` from `config.ts`, since the trigger doesn't read them from the code. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run before publishing. It is the row shape the sheet trigger sends. Use a Claim ID that is not yet in the table:

```json
{
  "id": 2,
  "row": 2,
  "COL$A": "CLM-TEST-001",
  "COL$B": "Test Claimant",
  "COL$C": "POL-0001",
  "COL$D": "1250.5",
  "COL$E": "Approved",
  "COL$F": "2026-10-29 10:00:00",
  "_content_hash": "5f06437ee67684835f8b282dbe596752"
}
```

Check that one record appears in the table with the claim ID, claimant, policy number, amount, status, received time and a link to row 2. Then run the same sample again. It should skip with `claim-already-in-table` and write nothing. If run-status tools aren't available, check the result in Zapier Tables directly. Ask the user to delete the test record and the test row; the agent doesn't delete data. Then publish with the trigger enabled, check it is active, and give the user the trigger's details to confirm.

## Notes

- To update an existing record's status and amount when its Claim ID already exists, change the create step to an update, so the table follows later sheet changes.
- To notify on urgent claims, add an email or Slack step after the create, sent to the connected account or to the owner only.
- If two sheet rows share a Claim ID, only the first one written gets a record.
- Never commit a real spreadsheet ID or table ID to a public repository.
