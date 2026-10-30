---
name: move-processed-insight-cards-into-the-insights-list
description: Build a Zapier Next Gen Zap that takes a list of processed insight items by webhook and moves each referenced Trello card into the product insights list, one card at a time. Use when a product or research team triages insights as Trello cards and wants processed ones moved into the insights list without manual drags.
metadata:
  author: zapier
  summary: "When a batch of processed insights comes in, each matching Trello card is moved into your insights list, one at a time, so triage starts from one place."
  apps: "Webhooks by Zapier, Trello"
  category: "Product"
  job: "User research management"
  source: "https://zapier.com/automations/product/user-research-management/insight-distribution/move-processed-insight-cards-into-the-insights-list"
---

# Move processed insight cards into the insights list

## What it does

1. **Trigger:** a list of insight IDs arrives at a Webhooks by Zapier catch hook. The sender posts either a JSON array or an object with an `insights` array.
2. **Parse:** the workflow reads the list and turns each item into a card ID. If the list is empty, the run stops and moves nothing.
3. **Trello** moves each card to the insights list on the board. The moves run one at a time, with a pause between them, and a card that fails is counted and does not stop the rest.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `trello`: the user's Trello connection, for the account that owns the insight board.
3. **Constants:**
   - `TRELLO_BOARD_ID`: the board that holds the insight cards. It is the ID in the board's URL.
   - `TRELLO_INSIGHTS_LIST_ID`: the list the cards move into.
   - `SECONDS_BETWEEN_MOVES`: the pause between card moves. Defaults to `60`.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point their sending system at.

## Ask the user

- Which Trello board holds the insight cards, and which list is the insights list?
- What does the sending system post? The workflow accepts a JSON array or `{ "insights": [...] }`, and each item is either a card ID or an object with an `id`. If the sender uses another field name, change the code before installing.
- Are the insight IDs Trello card IDs? If they are something else, the lookup for the card must be added before the move.
- Should the pause between moves be shorter for small batches? The spec's Customize option uses 10 seconds.

## Test

Run this sample as a draft test run before publishing, with two card IDs that exist on the board:

```json
{
  "insights": ["YOUR_TRELLO_CARD_ID_1", "YOUR_TRELLO_CARD_ID_2"]
}
```

Confirm that both cards are now in the insights list and that the run reports `moved: 2, failed: 0`. The second move should start about a minute after the first. Then move the cards back if they were real data.

## Customize

- **Faster moves for small batches:** lower `SECONDS_BETWEEN_MOVES` to `10`.
- **Label or owner after the move:** add a Formatter step that sets a card label or owner after each move.

## Notes

- A card ID that Trello does not recognise counts as a failed move. Nothing is created for it.
- Items that are neither a string, a number nor an object with an `id` are counted as `unreadable` and skipped.
- Anyone who can post to the webhook URL can move cards on the board. Keep the URL private.
- Never commit a real board ID or webhook URL.
