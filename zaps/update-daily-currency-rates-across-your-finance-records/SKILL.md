---
name: update-daily-currency-rates-across-your-finance-records
description: Build a Zap on Zapier that pulls daily exchange rates and writes them to one Notion rate record, so finance and billing read rates from one place. Use when a team keeps currency rates by hand or wants one authoritative FX record refreshed on a schedule.
license: MIT
metadata:
  author: zapier
  summary: "Every hour, the latest exchange rates are fetched and written to one Notion record, so everyone reads the same numbers."
  apps: "Schedule by Zapier, Webhooks by Zapier, Notion"
  category: "Finance"
  job: "Treasury management"
  source: "https://zapier.com/automations/finance/treasury-management/foreign-exchange-management/update-daily-currency-rates-across-your-finance-records"
---

# Update daily currency rates across your finance records

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-daily-currency-rates-across-your-finance-records. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** the `schedule` app's `everyHour` event, every hour at :00, including weekends.
2. **webhook** GETs a public FX API and reads the `rates` object for the target currencies.
3. **notion** writes the rates as plain-text lines (`CAD: <rate>`, `ILS: <rate>`, four decimal places) to the body of one configured page.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | What goes there                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| `REPLACE_NOTION_PAGE_ID` | The Notion page or database item whose body receives the rates. Look it up with their Notion connection |

Also review these defaults with them:

- `FX_API_URL` in `config.ts`: a free public API with base USD. Change it if the team uses another base currency or provider.
- `TARGET_CURRENCIES` in `workflow.ts`: the ISO codes written to the page. Defaults to `CAD` and `ILS`.
- `weekends` in `triggers/every-hour.ts`: set to `"yes"`, so the hourly run also happens on weekends. Change it to skip them.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `notion` to the user's Notion connection for the workspace that holds the rate record. The schedule and `webhook` need no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with `REPLACE_NOTION_PAGE_ID` replaced by the user's answer. `triggers/every-hour.ts` and `connections/` are settings, not code: set the workflow's trigger from it (`schedule`, `everyHour`, `moh: 0`, `weekends: "yes"`, no connection). The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with the Notion page set to one the user controls. The trigger sends no input, so the sample input is `null`.

Check that the `fetch-fx-rates` output's `json` field holds a `rates` object with the target currencies, and that the page body ends with one new line per target currency, with values matching the run output. If run-status tools aren't available, check the result in Notion directly. Then publish, confirm the trigger is active, and tell the user what the rate record will show. Ask the user to delete the test lines from the page, not the agent.

## Notes

- Each run appends a new block of lines to the page body, so the page grows by one entry an hour. Clear old entries in Notion, or change the step to replace the body when that action is available.
- The `notion` action writes body text, not database property fields. Per-currency properties need a different Notion action or a property-by-property update, which the connection's field list must provide.
- The FX API is public and rate-limited. Keep the hourly schedule unless the provider's terms allow more.
- To extend it: write only when a rate has moved more than a set amount since the last write, or add a step after the FX fetch that writes a row or sends a message when `rates` is empty.
