---
name: set-next-follow-up-date-for-contact-items
description: Build a Zapier Next Gen Zap that sets a contact's next follow-up date in a monday.com board when its date column changes, one day later and moved off weekends. Use when a personal CRM or contact list lives in monday.com and the next follow-up should be scheduled automatically from the last contact date.
metadata:
  author: zapier
  summary: "When you update a contact's date in monday.com, the next follow-up date is set for you, one day later and never on a weekend."
  apps: "monday.com"
  category: "Personal Productivity"
  job: "Personal CRM"
  source: "https://zapier.com/automations/personal-productivity/personal-crm/contact-follow-up-reminders/set-next-follow-up-date-for-contact-items"
---

# Set next follow-up date for contact items

## What it does

1. **Trigger:** a date column on a monday.com board changes for an item (a contact).
2. The workflow adds one day to the new date. If the result falls on a Saturday or Sunday, it moves to the following Monday.
3. **monday.com** writes that date to the next-follow-up column of the same item, overwriting its current value.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** monday.com, Specific Column Value Changed in Board (`monday`, `specific_column_value_changed_in_board`). Its params are `board_id` (the board) and `column_id` (the date column that starts the run). Set `column_id` to the same value as `TRIGGER_COLUMN_ID`.
2. **Connections** (each alias in the code is the app's slug):
   - `monday`: the user's monday.com connection, for the account that owns the board.
3. **Constants:**
   - `BOARD_ID`: the board's number from its URL.
   - `TRIGGER_COLUMN_ID`: the date column whose changes start the workflow, such as `date4`.
   - `NEXT_FOLLOW_UP_COLUMN_ID`: the date column that receives the next follow-up date. Use the column's ID, not its title.
   - `QUALIFYING_STATUS`: a status label, such as `"Active"`, that an item must have to be updated. `null` updates every item whose date changes.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user it is live.

## Ask the user

- Which monday.com board holds the contacts, and which date column records the last contact?
- Which date column should hold the next follow-up date?
- Should only items with a certain status (a "stage") be updated? If so, which status label, and which column holds it? The default updates every item.

## Test

Use a test item on the board. Change its trigger date column to `2026-10-30`, a Friday. Run the workflow with this sample input (the shape of the trigger's output, from the `specific_column_value_changed_in_board` output schema):

```json
{
  "itemId": "1234567890",
  "date": "2026-10-30",
  "status": "Active"
}
```

Confirm that the test item's next-follow-up column now reads `2026-11-02`. Friday plus one day is Saturday, which moves to Monday. Then reset the test item to its previous values.

## Customize

- **Business days:** round follow-ups to the user's own business-day calendar instead of skipping weekends only.
- **Notify the owner:** add a Slack or email step after the update, to alert the assigned owner when the follow-up date changes.

## Notes

- The update writes the date in `YYYY-MM-DD` form, which monday.com date columns accept.
- The update overwrites the next-follow-up column each time. Items are matched by item ID, so no new items are created.
- Only the connected monday.com account's boards can be read or changed. Keep the board ID private if the board is shared.
