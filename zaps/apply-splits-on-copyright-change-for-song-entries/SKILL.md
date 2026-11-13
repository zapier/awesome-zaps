---
name: apply-splits-on-copyright-change-for-song-entries
description: Build a Zap on Zapier that recalculates and writes split percentages on a song item in a monday.com board whenever its copyright or allocation column changes, based on how many co-writers the song has. Use when a music publisher, label or songwriting team tracks royalty splits in monday.com and wants them recalculated without manual edits.
license: MIT
metadata:
  author: zapier
  summary: "When a song's copyright allocation changes in your monday.com board, the split percentages for each co-writer are recalculated and written back to the item."
  apps: "monday.com"
  category: "Legal"
  job: "Intellectual property management"
  source: "https://zapier.com/automations/legal/intellectual-property-management/copyright-management/apply-splits-on-copyright-change-for-song-entries"
---

# Apply splits on copyright change for song entries

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/apply-splits-on-copyright-change-for-song-entries. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a column value changes on a monday.com board (`monday`, `column_value_changed_in_board`). Any column can fire it; the code keeps only changes to the allocation column.
2. **Filter:** the run stops unless the changed column is the allocation column and the song has at least one co-writer. A song with more than five co-writers stops with a reason instead of getting partial splits.
3. **Calculate:** each co-writer gets an equal share rounded down to two decimals (1 gets 100, 2 get 50, 3 get 33.33, 4 get 25, 5 get 20). The main percentage column gets the sum of the written shares.
4. **monday.com** updates the item in one call: the split column for each co-writer slot and the main percentage column.

The zap overwrites existing split values, so point it at the board whose splits you intend to change.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                                                    | Where                                                                                 | What goes there                                                                                               |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `REPLACE_BOARD_ID`                                         | `triggers/column-value-changed-in-board.ts` (`board_id`) and `config.ts` (`BOARD_ID`) | The monday.com board that holds the song entries                                                              |
| `REPLACE_ALLOCATION_COLUMN_ID`                             | `config.ts` (`ALLOCATION_COLUMN_ID`)                                                  | The copyright/allocation column. Only changes to it run the zap                                               |
| `REPLACE_CONTRIBUTOR_COUNT_COLUMN_ID`                      | `config.ts` (`CONTRIBUTOR_COUNT_COLUMN_ID`)                                           | The column holding the number of co-writers. Declared for reference; the count comes from the trigger payload |
| `REPLACE_TOTAL_PERCENTAGE_COLUMN_ID`                       | `config.ts` (`TOTAL_PERCENTAGE_COLUMN_ID`)                                            | The main percentage column, which receives the total                                                          |
| `REPLACE_SPLIT_1_COLUMN_ID` to `REPLACE_SPLIT_5_COLUMN_ID` | `config.ts` (`SPLIT_1_COLUMN_ID` to `SPLIT_5_COLUMN_ID`)                              | The split percentage column for each co-writer slot, in order. Up to five                                     |

Defaults to review with them: shares are rounded down to two decimals, so three co-writers total 99.99, not 100. The zap skips songs with more than five co-writers, the length of the split list in `workflow.ts`.

Prerequisite questions:

- Does the trigger's payload include the item ID, the changed column ID and the co-writer count? This zap assumes it does. If not, a read step is needed to fetch the count before calculating.
- Could a song have more than five co-writers? If so, add split columns in `config.ts` and extend the split list in `workflow.ts`.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `monday` to the user's monday.com connection for the account that owns the board. The trigger and the actions both use it. No other app needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/column-value-changed-in-board.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connection, and sample the trigger, before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Once a monday.com connection and a test board exist, run a draft test (`run_workflow_draft`) on an item the test created, named `[install-test] …`, with this sample input:

```json
{
  "item_id": "<test item ID>",
  "column_id": "<allocation column ID from config.ts>",
  "contributor_count": 3
}
```

Check that the three split columns read `33.33`, the main percentage column reads `99.99`, and the item's other columns did not change. If run-status tools aren't available, check the item on the board directly. The user deletes the test item afterwards, not the agent.

Then publish, confirm the trigger is active, and tell the user it is live.

## Notes

- Splits are rounded down to two decimals, so three equal shares total 99.99. Change the rounding if the agreement needs exactly 100.
- Each allocation change overwrites the existing split values.
- To review changes first, add a notification step (for example a Slack or email message to the manager) before the monday.com update.
- To use split presets per song type or agreement, add a lookup table and use it instead of the equal-share calculation when a preset exists.
- Never commit a real board or column ID. Use placeholders in shared copies.
