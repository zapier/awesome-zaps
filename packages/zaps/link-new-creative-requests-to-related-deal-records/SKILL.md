---
name: link-new-creative-requests-to-related-deal-records
description: Build a Zapier Next Gen Zap that, when a new creative request is created on a monday.com requests board, finds the deal in your monday.com deal tracker whose name matches the request and links the request to that deal. Use when a marketing or creative team tracks design requests in monday.com and wants each request tied to its related deal without manual searching.
metadata:
  author: zapier
  summary: "When a new creative request lands on your board, its matching deal is found and linked to it, so the request owner sees the opportunity context straight away."
  apps: "monday.com"
  category: "Marketing"
  job: "Marketing creative"
  source: "https://zapier.com/automations/marketing/marketing-creative/design-request-management/link-new-creative-requests-to-related-deal-records"
---

# Link new creative requests to related deal records

## What it does

1. **Trigger:** a new item is created on your creative requests board in monday.com.
2. **Normalize:** the request's title is split on common separators and the first word is taken as the search token. If the title is empty, the run stops and writes nothing.
3. **monday.com** searches your deal board for items whose name matches that token. If nothing matches, the run stops and no deal record is created.
4. **monday.com** updates the new request item and sets its board-relation column to the first matching deal.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run. The trigger's board field and the update's column keys are dynamic and need a live connection to resolve.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** monday.com, New Item in Board (`monday`, `item_created_in_board`). Set its board to your requests board.
2. **Connections** (each alias in the code is the app's slug):
   - `monday`: the user's monday.com connection, for the account that can read the deal board and edit the requests board.
3. **Constants:**
   - `REQUESTS_BOARD_ID`: the monday.com board ID of the creative requests board.
   - `DEAL_BOARD_ID`: the monday.com board ID of the deal tracker.
   - `DEAL_NAME_COLUMN`: the column key on the deal board to match against. Defaults to `name`, the item name column.
   - `RELATION_COLUMN_ID`: the board-relation column on the requests board that points to deals.

## Ask the user

- Which monday.com board holds creative requests, and which holds deals?
- Which column on the deal board holds the deal name the request should match? The default is the item name.
- Which board-relation column on the requests board should receive the matched deal?
- If a title has several words, is the first word a good enough match? The default is yes, and the first search result is used when several deals match.

## Test

Build the workflow, then run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) with a request that has a deal in your tracker:

```json
{
  "id": "1234567890",
  "name": "Acme spring campaign banner"
}
```

Confirm that the request item's relation column now links to the deal whose name starts with `Acme`, and that no other item changed. Then tell the user to unlink it if the request was real data.

## Customize

- **Create a deal when none matches:** add a monday.com create-item step on the deal board when the search returns no results.
- **Assign the request owner from the deal:** after the link, copy the matched deal's owner field into the request's person column.

## Notes

- The matching uses only the first word of the title, so short or generic first words can match the wrong deal. Check the deal name column is distinctive.
- If several deals match, the first result is linked. Duplicate deal names will link to whichever monday.com returns first.
- Only the trigger's board and the deal board are read. Nothing is sent to anyone.
