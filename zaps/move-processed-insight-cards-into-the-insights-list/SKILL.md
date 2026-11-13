---
name: move-processed-insight-cards-into-the-insights-list
description: Build a Zap on Zapier that takes a list of processed insight items by webhook and moves each referenced Trello card into the product insights list, one card at a time. Use when a product or research team triages insights as Trello cards and wants processed ones moved into the insights list without manual drags.
license: MIT
metadata:
  author: zapier
  summary: "When a batch of processed insights comes in, each matching Trello card is moved into your insights list, one at a time, so triage starts from one place."
  apps: "Webhooks by Zapier, Trello"
  category: "Product"
  job: "User research management"
  source: "https://zapier.com/automations/product/user-research-management/insight-distribution/move-processed-insight-cards-into-the-insights-list"
---

# Move processed insight cards into the insights list

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/move-processed-insight-cards-into-the-insights-list. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a list of insight IDs arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). The sender posts either a JSON array or an object with an `insights` array. If the list is empty, the run stops and moves nothing.
2. **Parse:** each item becomes a card ID. An item that is neither a string, a number nor an object with an `id` is counted as unreadable and skipped.
3. **Trello** moves each card to the insights list on the board, one at a time, with a pause between moves. A card that fails is counted and does not stop the rest. The Zap only moves cards; it never creates, edits or deletes them.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                   | What goes there                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| `TRELLO_BOARD_ID`         | The Trello board that holds the insight cards. Find it by name with the user's Trello connection |
| `TRELLO_INSIGHTS_LIST_ID` | The list on that board the cards move into. Find it by name on that board                        |

Also review with them:

- `SECONDS_BETWEEN_MOVES` in `workflow.ts`: the pause between moves, 60 seconds by default to avoid rate limits. 10 seconds suits small batches.
- What does the sending system post? The workflow accepts a JSON array or `{ "insights": [...] }`, and each item is either a card ID or an object with an `id`. If the sender uses another field name, change the code before installing.
- Are the insight IDs Trello card IDs? If they are something else, a lookup for the card must be added before the move.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `trello` to the user's Trello connection for the account that owns the insight board. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the Trello action's fields with the user's connection before the first test run, and fix any key in `workflow.ts` that doesn't match. Then give the user the webhook URL to point their sending system at.

## Test it

Run it once as a draft test with two cards the user controls on the board:

```json
{
  "insights": ["5f1a2b3c4d5e6f7a8b9c0d01", "5f1a2b3c4d5e6f7a8b9c0d02"]
}
```

Check that both cards are now in the insights list and that the run reports `moved: 2, failed: 0`. The second move should start about a minute after the first. If run-status tools aren't available, check the cards in Trello directly. Then ask the user to move the test cards back or delete them; the user deletes test data, not the agent.

## Notes

- A card ID that Trello does not recognise counts as a failed move, and nothing is created for it.
- Anyone who can post to the webhook URL can move cards on the board. Keep the URL private, and never commit a real board ID or webhook URL.
- To set a label or owner after each move, add a Formatter step that does it after the Trello step.
