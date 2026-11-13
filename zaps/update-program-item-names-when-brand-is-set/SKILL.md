---
name: update-program-item-names-when-brand-is-set
description: Build a Zap on Zapier that renames a monday.com program item when its Brand column is set, composing the new name from configured title-part columns plus the Brand value, and posting an update note. Use when a design or brand team keeps program items on a monday.com board and wants consistent, searchable item names without typing them by hand.
license: MIT
metadata:
  author: zapier
  summary: "When a Brand value is picked on a program item, its name is rebuilt from its title parts and the brand, so the board stays consistent and searchable."
  apps: "monday.com"
  category: "Design"
  job: "Brand management"
  source: "https://zapier.com/automations/design/brand-management/brand-consistency-monitoring/update-program-item-names-when-brand-is-set"
---

# Update program item names when brand is set

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-program-item-names-when-brand-is-set. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a monday.com item's Brand column value changes on the program board (`monday`, `specific_column_value_changed_in_board`).
2. **monday.com** reads the Brand column and the title-part columns for that item. If Brand is empty, the run stops.
3. The new name is the non-empty title-part values followed by the Brand value, joined with `-`.
4. **monday.com** renames that item to the new name, then posts an update note on it saying why the name changed.

Items with an empty Brand are never renamed.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                                                               | Where                                                                                     | What goes there                                                    |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `REPLACE_BOARD_ID`                                                    | `config.ts`, `BOARD_ID`; `triggers/specific-column-value-changed-in-board.ts`, `board_id` | The program board                                                  |
| `REPLACE_BRAND_COLUMN_ID`                                             | `config.ts`, `BRAND_COLUMN_ID`; the same trigger file, `column_id`                        | The column that holds the Brand value. Setting it starts a rename  |
| `REPLACE_TITLE_PART_COLUMN_ID_1` and `REPLACE_TITLE_PART_COLUMN_ID_2` | `config.ts`, `TITLE_PART_COLUMN_IDS`                                                      | The dropdown columns that come before Brand in the title, in order |

Also review the defaults with them: `TITLE_SEPARATOR` in `config.ts` (`" - "`) and `CHANGE_NOTE` in `workflow.ts` (the start of the update note). If the title has more or fewer parts than two, add or remove entries in `TITLE_PART_COLUMN_IDS`.

The color part must be one of the title-part columns.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `monday` (the account that can edit the program board) to the user's monday.com connection. The trigger and both actions use it. No other app needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/specific-column-value-changed-in-board.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and take `board_id` and `column_id` from the trigger file. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connection, and sample the trigger, before the first test run. Fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a sample from a real program item on a test board:

```json
{
  "id": "1234567890"
}
```

Check that the item's name changed to the title parts plus Brand and that one update note was added. Then check that an item with an empty Brand is left alone. If run-status tools aren't available, check the result in monday.com directly. Ask the user to delete the test data; the agent does not delete it. Publish only after the test passes, then confirm the trigger is active.

## Notes

- monday.com's trigger fires on any change to the Brand column, including a cleared value. The Brand-empty check is what skips those.
- The update note is plain text, so it notifies nobody and mentions no one.
- To notify the team channel when a title changes, add a Slack message step after the rename.
- To add campaign codes or dates to the title, add their columns to `TITLE_PART_COLUMN_IDS` once they are available.
- Never commit a real board ID, column ID or webhook URL.
