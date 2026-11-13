---
name: link-new-creative-requests-to-related-deal-records
description: Build a Zap on Zapier that, when a new creative request is created on a monday.com requests board, finds the deal in your monday.com deal tracker whose name matches the request and links the request to that deal. Use when a marketing or creative team tracks design requests in monday.com and wants each request tied to its related deal without manual searching.
license: MIT
metadata:
  author: zapier
  summary: "When a new creative request lands on your board, its matching deal is found and linked to it, so the request owner sees the opportunity context straight away."
  apps: "monday.com"
  category: "Marketing"
  job: "Marketing creative"
  source: "https://zapier.com/automations/marketing/marketing-creative/design-request-management/link-new-creative-requests-to-related-deal-records"
---

# Link new creative requests to related deal records

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/link-new-creative-requests-to-related-deal-records. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new item is created on the creative requests board in monday.com (`monday`, `item_created_in_board`).
2. **Normalize:** the request's title is split on common separators and the first word is taken as the search token. If the title is empty, the run stops and writes nothing.
3. **monday** searches the deal board for items whose name matches that token. If nothing matches, the run stops and no deal record is created.
4. **monday** updates the new request item and sets its board-relation column to the first matching deal.

The Zap only reads the requests and deal boards and edits the request's relation column. Nothing is sent to anyone.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                      | Where                                                                             | What goes there                                                        |
| ---------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `REPLACE_REQUESTS_BOARD_ID`  | `config.ts`, `REQUESTS_BOARD_ID`; `triggers/item-created-in-board.ts`, `board_id` | The creative requests board the trigger watches                        |
| `REPLACE_DEAL_BOARD_ID`      | `config.ts`, `DEAL_BOARD_ID`                                                      | The deal tracker board to search for a matching deal                   |
| `REPLACE_RELATION_COLUMN_ID` | `config.ts`, `RELATION_COLUMN_ID`                                                 | The board-relation column on the requests board that receives the deal |

The trigger and `config.ts` share `REPLACE_REQUESTS_BOARD_ID`, so one answer fills both.

Also review the default with them: `DEAL_NAME_COLUMN` is `name`, the item name column of the deal board. The match uses the title's first word, so confirm that is specific enough for their titles.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `monday` to the user's monday.com connection, for the account that can read the deal board and edit the requests board. It is the only account.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/item-created-in-board.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connection and sample the trigger, since it has one, before the first test run. Fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, using a test request on the requests board and a test deal on the deal board whose name starts with `Acme`:

```json
{
  "id": "1234567890",
  "name": "Acme spring campaign banner"
}
```

Confirm that the request item's relation column now links to the deal whose name starts with `Acme`, and that no other item changed. If run-status tools aren't available, check the result in monday.com directly. Then publish and confirm the trigger is active. The user deletes test data, not the agent.

## Notes

- The match uses only the first word of the title, so a short or generic first word can match the wrong deal. Make sure the deal name column is distinctive.
- If several deals match, the first result is linked, so duplicate deal names link to whichever monday.com returns first.
- To create a deal when none matches, add a create-item step on the deal board after the search. To copy the matched deal's owner onto the request, add a step after the link that sets the request's person column.
