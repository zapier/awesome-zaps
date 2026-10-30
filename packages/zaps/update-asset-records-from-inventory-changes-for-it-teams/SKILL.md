---
name: update-asset-records-from-inventory-changes-for-it-teams
description: Build a Zapier Next Gen Zap that keeps a central IT asset database in step with an inventory database in Notion. Use when devices are tracked in one Notion database (serial, model, warranty, owner, status) and IT wants a single asset register updated whenever an inventory item changes, without copying by hand.
metadata:
  author: zapier
  summary: "When a device's record in your inventory changes, its matching asset record in your central Notion database is found, or created if missing, and updated with the latest details."
  apps: "Notion"
  category: "IT"
  job: "IT operations"
  source: "https://zapier.com/automations/it/it-operations/it-asset-management/update-asset-records-from-inventory-changes-for-it-teams"
---

# Update asset records from inventory changes

## What it does

1. **Trigger:** a Notion inventory data source item has one or more properties updated (Notion, Updated Properties in Data Source Item).
2. **Notion** searches the asset data source for an item whose serial number matches the inventory item's. Items with no serial number are skipped.
3. If the asset record exists and the inventory change is not newer than its `last_edited_time`, the run stops and writes nothing.
4. **Notion** updates the matching asset record, or creates one if there is no match, copying device name, model, warranty start and end, notes, contact email, assigned owner and inventory status.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top.

1. **Trigger:** Notion, Updated Properties in Data Source Item (`notion`, `updated_data_source_item_properties`). Set `datasource` to the inventory data source. Connection: the user's Notion connection.
2. **Connections** (each alias in the code is the app's slug):
   - `notion`: the user's Notion connection, for the workspace that holds both databases.
3. **Constants:**
   - `INVENTORY_DATASOURCE_ID`: the inventory data source. Used by the trigger setting, not by the code.
   - `ASSET_DATASOURCE_ID`: the central asset data source the records are written to.
   - `INVENTORY_IDENTIFIER_PROPERTY`, `ASSET_IDENTIFIER_PROPERTY`: the serial number or unique identifier property on each side.
   - `FIELD_MAP`: pairs of inventory property and asset property for each field to copy. The defaults are the spec's field names; rename them to match the user's databases.

## Ask the user

- Which Notion databases are the inventory and the central asset register? Share both with the connected integration.
- Which property holds the serial number or unique identifier on each side?
- What are the property names for device name, model, warranty start and end, notes, contact email, assigned owner and status?

## Test

The first draft test should use a clearly marked inventory item and an asset record that exists, for example `[install-test] Laptop`, with a serial number that appears in the asset database. Then run one item with no serial number and check that it skips.

Expected result: the matching asset row's fields change to the inventory values, and no new row is created. For a serial number that does not exist in the asset database, expect one new row with the same fields.

## Customize

- **Alert on new or unmatched devices:** add a Slack or email step after the upsert.
- **Normalize values:** add a formatter step to tidy warranty dates or owner names before saving.

## Notes

- The "overwrite only when newer" rule compares the inventory item's `last_edited_time` with the asset record's, which are timestamps from two different databases. It is a best effort, not a true version check.
- Never commit a real Notion data source ID.
