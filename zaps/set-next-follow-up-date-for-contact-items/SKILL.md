---
name: set-next-follow-up-date-for-contact-items
description: Build a Zap on Zapier that sets a contact's next follow-up date in a monday.com board when its date column changes, one day later and moved off weekends. Use when a personal CRM or contact list lives in monday.com and the next follow-up should be scheduled automatically from the last contact date.
license: MIT
metadata:
  author: zapier
  summary: "When you update a contact's date in monday.com, the next follow-up date is set for you, one day later and never on a weekend."
  apps: "monday.com"
  category: "Personal Productivity"
  job: "Personal CRM"
  source: "https://zapier.com/automations/personal-productivity/personal-crm/contact-follow-up-reminders/set-next-follow-up-date-for-contact-items"
---

# Set next follow-up date for contact items

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/set-next-follow-up-date-for-contact-items. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a date column on a monday.com board changes for an item, a contact (`monday`, `specific_column_value_changed_in_board`).
2. The Zap adds one day to the new date. If the result falls on a Saturday or Sunday, it moves to the following Monday.
3. **monday.com** writes that date to the next-follow-up column of the same item, overwriting its current value.

The Zap changes only that column on the item that changed, and creates no items.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                            | Where                                                                                               | What goes there                                                                           |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `REPLACE_BOARD_ID`                 | `config.ts`, `BOARD_ID`; `triggers/specific-column-value-changed-in-board.ts`, `board_id`           | The monday.com board that holds the contacts                                              |
| `REPLACE_TRIGGER_COLUMN_ID`        | `config.ts`, `TRIGGER_COLUMN_ID`; `triggers/specific-column-value-changed-in-board.ts`, `column_id` | The date column that records the last contact. Its changes start the Zap                  |
| `REPLACE_NEXT_FOLLOW_UP_COLUMN_ID` | `config.ts`, `NEXT_FOLLOW_UP_COLUMN_ID`                                                             | The date column that receives the next follow-up date. Use the column's ID, not its title |

Each value that appears in two files takes one answer in both places.

Also review these defaults with the user:

- `QUALIFYING_STATUS` in `workflow.ts` is `null`, so every item whose date changes is updated. To update only items with a certain status (a "stage"), ask which status label qualifies (such as `"Active"`) and which column holds it, then set `QUALIFYING_STATUS` to that label.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `monday` to the user's monday.com connection for the account that owns the board. The trigger and the action use the same one. No other apps need a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/specific-column-value-changed-in-board.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's `board_id` and `column_id` to the same answers as `BOARD_ID` and `TRIGGER_COLUMN_ID`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the monday.com action's fields with the user's connection, and sample the trigger, before the first test run. Fix any key in `workflow.ts` that doesn't match, including the column key built from `NEXT_FOLLOW_UP_COLUMN_ID`.

## Test it

Use a test item on the board the user controls, and set its trigger date column to `2026-10-30`, a Friday. Run the workflow once as a draft test with this sample input:

```json
{
  "itemId": "1234567890",
  "date": "2026-10-30",
  "status": "Active"
}
```

Check that the item's next-follow-up column now reads `2026-11-02`. Friday plus one day is Saturday, which moves to Monday. If run-status tools aren't available, check the item in monday.com directly. Then publish, confirm the trigger is active, and tell the user the Zap is live. Ask the user to delete the test item; the agent does not delete test data.

## Notes

- The update writes the date in `YYYY-MM-DD` form, which monday.com date columns accept. It overwrites the next-follow-up column each time, and items are matched by item ID.
- Only the connected monday.com account's boards can be read or changed. Keep the board ID private if the board is shared.
- To round follow-ups to the user's own business-day calendar instead of skipping weekends only, change the date step in `workflow.ts`.
- To alert the assigned owner when the follow-up date changes, add a Slack or email step after the update.
