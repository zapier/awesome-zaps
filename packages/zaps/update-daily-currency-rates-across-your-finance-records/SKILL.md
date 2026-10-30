---
name: update-daily-currency-rates-across-your-finance-records
description: Build a Zapier Next Gen Zap that pulls daily exchange rates and writes them to one Notion rate record, so finance and billing read rates from one place. Use when a team keeps currency rates by hand or wants one authoritative FX record refreshed on a schedule.
metadata:
  author: zapier
  summary: "Every hour, the latest exchange rates are fetched and written to one Notion record, so everyone reads the same numbers."
  apps: "Schedule by Zapier, Webhooks by Zapier, Notion"
  category: "Finance"
  job: "Treasury management"
  source: "https://zapier.com/automations/finance/treasury-management/foreign-exchange-management/update-daily-currency-rates-across-your-finance-records"
---

# Update daily currency rates across your finance records

## What it does

1. **Trigger:** Schedule by Zapier, every hour at :00, including weekends.
2. **Webhooks by Zapier** GETs a public FX API and reads the `rates` object for the target currencies.
3. **Notion** writes the rates as plain-text lines (`CAD: <rate>`, `ILS: <rate>`, four decimal places) to the body of one configured page.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below.

1. **Trigger:** Schedule by Zapier, `everyHour` (`schedule`). It needs no connection, so its `authentication_id` is `null`. Params: `moh: 0`, `weekends: "yes"`.
2. **Connections** (each alias in the code is the app's slug):
   - `notion`: the user's Notion connection, for the workspace that holds the rate record.
   - Webhooks by Zapier (`webhook`, GET) needs no connection.
3. **Constants:**
   - `NOTION_PAGE_ID`: the ID of the Notion page or database item that holds the rates.
   - `TARGET_CURRENCIES`: ISO codes to write. Defaults to `["CAD", "ILS"]`.
   - `FX_API_URL`: the rates endpoint. Defaults to a free public API with base USD.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user what the rate record will show.

## Ask the user

- Which Notion page should hold the rates? Give its ID.
- Which currencies, and which base currency? The default API is base USD.
- Should the hourly run skip weekends? The default runs on weekends too.

## Test

Run a draft test (`run_workflow_draft`) before publishing. The trigger sends no input, so the input is `null`. Then:

- Check the run's `fetch-fx-rates` output: the `json` field should hold a `rates` object with the target currencies.
- Check the Notion page: its body should end with one new line per target currency, and the values should match the run output.
- Remember that each run appends to the page body (see Notes).

## Customize

- **Change only on threshold:** write only when a rate has moved more than a set amount since the last write.
- **Error log or alert on failed fetch:** add a step after the FX fetch that writes a row or sends a message when `rates` is empty.

## Notes

- The Notion action in this zap writes body text, not database property fields. If the rate record needs per-currency properties, that needs a different Notion action or a property-by-property update, which the connection's field list must provide.
- Each run appends a new block of lines to the page body, so the page grows by one entry an hour. Clear old entries in Notion, or change the step to replace the body when that action is available.
- The FX API is public and rate-limited. Keep the hourly schedule unless the provider's terms allow more.
