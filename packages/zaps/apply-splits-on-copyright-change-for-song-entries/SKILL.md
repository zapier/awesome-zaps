---
name: apply-splits-on-copyright-change-for-song-entries
description: Build a Zapier Next Gen Zap that recalculates and writes split percentages on a song item in a monday.com board whenever its copyright or allocation column changes, based on how many co-writers the song has. Use when a music publisher, label or songwriting team tracks royalty splits in monday.com and wants them recalculated without manual edits.
metadata:
  author: zapier
  summary: "When a song's copyright allocation changes in your monday.com board, the split percentages for each co-writer are recalculated and written back to the item."
  apps: "monday.com"
  category: "Legal"
  job: "Intellectual property management"
  source: "https://zapier.com/automations/legal/intellectual-property-management/copyright-management/apply-splits-on-copyright-change-for-song-entries"
---

# Apply splits on copyright change for song entries

## What it does

1. **Trigger:** a monday.com board's column value changes (any column; the code keeps only changes to the allocation column).
2. **Filter:** the run stops unless the changed column is the allocation column and the song has at least one co-writer. A song with more than 5 co-writers stops with a reason instead of writing partial splits.
3. **Calculate:** each co-writer gets an equal share rounded down to two decimals (1 → 100, 2 → 50, 3 → 33.33, 4 → 25, 5 → 20). The main percentage column gets the sum of the written shares.
4. **monday.com** updates the item in one call: the split columns for each co-writer slot and the main percentage column. Existing split values are overwritten.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** monday.com, Any Column Value Changed in Board (`monday` / `column_value_changed_in_board`). Set `board_id` to the board's integer ID. The trigger needs a monday.com connection.
2. **Connections** (the alias in the code is the app's slug):
   - `monday`: the user's monday.com connection, for the account that owns the board.
3. **Constants:**
   - `BOARD_ID`: the integer ID of the board that holds the song entries.
   - `ALLOCATION_COLUMN_ID`: the column ID of the copyright/allocation field. Only changes to this column run the workflow.
   - `CONTRIBUTOR_COUNT_COLUMN_ID`: the column that holds the number of co-writers. Declared for reference; the code reads the count from the trigger payload (see Ask the user).
   - `SPLIT_COLUMN_IDS`: the split percentage columns, one per co-writer slot, in order. Up to five.
   - `TOTAL_PERCENTAGE_COLUMN_ID`: the main percentage column that receives the total.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user it is live.

## Ask the user

- Which board holds the song entries? What is its ID?
- Which column is the copyright/allocation field, which column holds the co-writer count, which are the split percentage columns and which is the main percentage column?
- Does the trigger's payload include the item ID, the changed column ID and the co-writer count? If not, a read step is needed to fetch the count from the item before calculating. This zap assumes the payload carries them.
- Is a song with more than five co-writers possible? If so, the split columns need extending.

## Test

Once a monday.com connection and a test board exist, run a draft test (`run_workflow_draft`) on an item the test created, named `[install-test] …`, with this sample input:

```json
{
  "item_id": "YOUR_TEST_ITEM_ID",
  "column_id": "YOUR_ALLOCATION_COLUMN_ID",
  "contributor_count": 3
}
```

Check that the three split columns read `33.33`, the main percentage column reads `99.99`, and the item's other columns did not change. Then delete the test item only if you created it.

## Customize

- **Manager review before writing:** add a notification step (for example a Slack or email message to the manager) before the monday.com update, so changes are reviewed first.
- **Split presets:** add a lookup table of custom split presets per song type or agreement, and use it instead of the equal-share calculation when a preset exists.

## Notes

- Splits are rounded down to two decimals, so three equal shares total 99.99, not 100. Change the rounding if the agreement needs a total of exactly 100.
- The workflow overwrites existing split values each time the allocation column changes.
- Never commit a real board ID or column ID. Use placeholders in shared copies.
