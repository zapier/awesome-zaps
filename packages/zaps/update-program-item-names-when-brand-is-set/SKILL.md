---
name: update-program-item-names-when-brand-is-set
description: Build a Zapier Next Gen Zap that renames a monday.com program item when its Brand column is set, composing the new name from configured title-part columns plus the Brand value, and posting an update note. Use when a design or brand team keeps program items on a monday.com board and wants consistent, searchable item names without typing them by hand.
metadata:
  author: zapier
  summary: "When a Brand value is picked on a program item, its name is rebuilt from its title parts and the brand, so the board stays consistent and searchable."
  apps: "monday.com"
  category: "Design"
  job: "Brand management"
  source: "https://zapier.com/automations/design/brand-management/brand-consistency-monitoring/update-program-item-names-when-brand-is-set"
---

# Update program item names when brand is set

## What it does

1. **Trigger:** a monday.com item's Brand column value changes on the program board (`specific_column_value_changed_in_board`).
2. **monday.com** reads the Brand column and the title-part columns for that item. If Brand is empty, the run stops and changes nothing.
3. The new name is the non-empty title-part values followed by the Brand value, joined with `-`.
4. **monday.com** renames that item to the new name, then posts an update note on it saying why the name changed.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** monday.com, Any column value changed on a specific board: `specific_column_value_changed_in_board` (`monday`). Set `board_id` and `column_id` to the board and the Brand column.
2. **Connections** (each alias in the code is the app's slug):
   - `monday`: the user's monday.com connection, for the account that can edit the program board.
3. **Constants:**
   - `BOARD_ID`: the monday.com board ID of the program board.
   - `BRAND_COLUMN_ID`: the column ID of the Brand dropdown. Setting it starts the rename.
   - `TITLE_PART_COLUMN_IDS`: column IDs of the dropdowns that come before the Brand value in the title, in order.
   - `TITLE_SEPARATOR`: text placed between title parts. Defaults to `" - "`.
   - `CHANGE_NOTE`: the start of the update note posted after a rename. The new name is appended.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user where the trigger fires.

## Ask the user

- Which board is the program board, and which column is Brand?
- Which dropdown columns make up the title, and in what order? The spec's "color part" needs to be one of them.
- Should the separator or the update note wording differ from the defaults?

## Test

To test, run the draft (`run_workflow_draft`) with a sample from a real program item, for example:

```json
{
  "id": "1234567890"
}
```

Use an item on a test board, and check that the item's name changed to the title parts plus Brand and that one update note was added. Confirm that an item with an empty Brand is left alone. Only then publish and confirm the trigger is active.

## Customize

- **Notify the team channel** when a title changes: add a Slack message step after the update.
- **Add campaign codes or dates** to the title pattern when they are available: add their columns to the title-part list.

## Notes

- monday.com's trigger fires on any change to the Brand column, so the workflow relies on the Brand-empty check to skip cleared values.
- The update note is a plain text update, so it notifies nobody and mentions no one.
- Never commit a real board ID, column ID or webhook URL.
