---
name: update-asset-records-from-inventory-changes-for-it-teams
description: Build a Zap on Zapier that keeps a central IT asset database in step with an inventory database in Notion. Use when devices are tracked in one Notion database (serial, model, warranty, owner, status) and IT wants a single asset register updated whenever an inventory item changes, without copying by hand.
license: MIT
metadata:
  author: zapier
  summary: "When a device's record in your inventory changes, its matching asset record in your central Notion database is found, or created if missing, and updated with the latest details."
  apps: "Notion"
  category: "IT"
  job: "IT operations"
  source: "https://zapier.com/automations/it/it-operations/it-asset-management/update-asset-records-from-inventory-changes-for-it-teams"
---

# Update asset records from inventory changes

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-asset-records-from-inventory-changes-for-it-teams. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a property changes on an item in the inventory database (`notion`, `updated_data_source_item_properties`).
2. **Notion** searches the asset database for an item with the same serial number. Items with no serial number are skipped.
3. If the asset record exists and the inventory change is not newer than its `last_edited_time`, the run stops and writes nothing.
4. **Notion** updates the matching asset record, or creates one if there is no match, copying device name, model, warranty start and end, notes, contact email, assigned owner and inventory status.

The Zap never writes an inventory change over a newer asset record.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                   | Where                                                                              | What goes there                                   |
| ------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------- |
| `INVENTORY_DATASOURCE_ID` | `config.ts`, and `datasource` in `triggers/updated-data-source-item-properties.ts` | The inventory Notion database the trigger watches |
| `ASSET_DATASOURCE_ID`     | `config.ts`                                                                        | The central asset register that gets updated      |

Both databases must be shared with the user's Notion connection.

Also review the defaults with them: `INVENTORY_IDENTIFIER_PROPERTY` and `ASSET_IDENTIFIER_PROPERTY` in `config.ts` (the serial number or unique identifier property on each side, both `Serial number` by default), and `FIELD_MAP` at the top of `workflow.ts`, which pairs each inventory property with its asset property. Rename the property names to match their databases.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `notion` to the user's Notion connection for the workspace that holds both databases. The trigger and the actions use the same one. No other apps need an account.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-data-source-item-properties.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, with the trigger's `datasource` set to the inventory answer. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a sample inventory item. Use sample values only:

```json
{
  "id": "sample-inventory-item-1",
  "last_edited_time": "2026-11-09T15:00:00.000Z",
  "properties": {
    "Serial number": "SAMPLE-SN-0001",
    "Device name": "[install-test] Laptop",
    "Model": "Sample Model 14",
    "Warranty start": "2026-01-01",
    "Warranty end": "2029-01-01",
    "Notes": "Sample note",
    "Contact email": "owner@example.com",
    "Assigned owner": "Sample Owner",
    "Inventory status": "In use"
  }
}
```

Check these results, using an asset database the user controls:

- With an asset record whose serial number is `SAMPLE-SN-0001`, that record's fields change to the inventory values and no new row is created.
- With the same sample but no `Serial number`, the run skips and writes nothing.
- With a serial number that is not in the asset database, one new row is created with the same fields.

If run-status tools aren't available, check the result in Notion directly. Ask the user to delete the test rows; the agent doesn't delete test data. Publish only after the test passes, and confirm the trigger is active.

## Notes

- The "newer" check compares the inventory item's `last_edited_time` with the asset record's. Those timestamps come from two databases, so it is a best effort, not a true version check.
- To alert on new or unmatched devices, add a Slack or email step after the upsert. To tidy warranty dates or owner names, add a formatter step before the save.
- Never commit a real Notion data source ID.
