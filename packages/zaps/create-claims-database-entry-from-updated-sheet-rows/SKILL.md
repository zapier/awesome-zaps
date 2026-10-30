---
name: create-claims-database-entry-from-updated-sheet-rows
description: Build a Zapier Next Gen Zap that copies each updated row of an insurance claims sheet into a Zapier Table as a claim record, once per claim ID, with a link back to the row. Use when a claims or intake team tracks claims in Google Sheets and wants a structured, deduplicated claims database in Zapier Tables without manual copying.
metadata:
  author: zapier
  summary: "When a claim row in your sheet is updated, a matching claim record is added to your Zapier Table, with a link back to the row, so triage works from one clean list."
  apps: "Google Sheets, Zapier Tables"
  category: "Business Owners"
  job: "Insurance management"
  source: "https://zapier.com/automations/business-owners/insurance-management/claims-management/create-claims-database-entry-from-updated-sheet-rows"
---

# Create claims database entry from updated sheet rows

## What it does

1. **Trigger:** a row in your claims sheet is updated (Google Sheets "Updated Spreadsheet Row").
2. **Filter:** if the row has no Claim ID, the run stops and writes nothing.
3. **Zapier Tables** looks for a record whose Claim ID matches. If one exists, the run stops: the claim is already in the table.
4. **Zapier Tables** creates a record with the claim ID, claimant name, policy number, claim amount, status, received-at time, and a link to the sheet row.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Sheets, `updated_row_only` ("Updated Spreadsheet Row", app version 2.17.3). Set its `spreadsheet` and `worksheet` to the same values as the constants below. The trigger does not read them from the code.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the user's Google Sheets connection, for the account that owns the claims sheet.
   - Zapier Tables needs no connection. Its alias is `zapier-tables`, used directly in each step.
3. **Constants:**
   - `SPREADSHEET_ID`: the long ID in the sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `CLAIMS_TABLE_ID`: the Zapier Table's ID, from its URL.
   - `REFERENCE_FIELD`: the table field key that holds the claim ID. `"f1"` is the first field. If you build the table in a different order, use that field's key.
   - `CLAIM_ID_COLUMN`, `CLAIMANT_NAME_COLUMN`, `POLICY_NUMBER_COLUMN`, `CLAIM_AMOUNT_COLUMN`, `STATUS_COLUMN`, `RECEIVED_AT_COLUMN`: column keys such as `COL$A`, not header names. Map the user's headers to their column letters.
4. The Zapier Table needs seven fields in this order: Claim ID (text), Claimant Name (text), Policy Number (text), Claim Amount (number), Status (text), Received At (date and time), Sheet Row Link (text). Build it first, then put its ID in `CLAIMS_TABLE_ID`.
5. Test with the steps below, then publish with the trigger enabled, check it is active, and give the user the trigger's details to confirm.

## Ask the user

- Which sheet and tab hold the claims, and which columns hold the claim ID, claimant name, policy number, claim amount, status and received time?
- Which Zapier Table should receive the records? Should it be the table described above, or one that already exists?
- The trigger only fires when an existing row is updated. Should brand-new rows also create records? If yes, switch the trigger to "New or Updated Spreadsheet Row" (`updated_row_notify_hook`) and check it fires as expected.
- What time zone is the "Received At" column in? Zapier Tables reads the text as a time in the account's time zone, so a sheet in another zone will show shifted times.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. It is the row shape the sheet trigger sends. Use a Claim ID that is not yet in the table:

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

Check that one record appears in the table with the claim ID, claimant, policy number, amount, status, received time and a link to row 2. Then run the same sample again. It should skip with `claim-already-in-table` and write nothing. Afterwards, delete the test record and row if they were real data.

## Customize

- **Notify on urgent claims:** add an email or Slack step after the create. Send it to the connected account or to the owner only.
- **Update instead of skip on a match:** when the Claim ID already exists, update that record's status and amount instead of skipping, so the table follows later sheet changes.

## Notes

- The workflow only skips duplicates. It does not update an existing record. The Customize item above adds that.
- Zapier Tables reads "Received At" text in the account's time zone.
- If two sheet rows share a Claim ID, only the first one written gets a record.
- Never commit a real spreadsheet ID or table ID to a public repository.
