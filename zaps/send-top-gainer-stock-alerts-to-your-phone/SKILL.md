---
name: send-top-gainer-stock-alerts-to-your-phone
description: Build a Zap on Zapier that reads market text posted to a webhook, pulls out stock ticker symbols with AI, saves each new ticker to a Zapier Tables stocks table, and texts you a short alert with a search link. Use when you want top-gainer or market-mover alerts on your phone without checking a feed, and a record of which tickers you've already been alerted about.
license: MIT
metadata:
  author: zapier
  summary: "When market text arrives, each new stock ticker in it is saved to your stocks table and texted to your phone with a search link, so you see movers without checking a feed."
  apps: "Webhooks by Zapier, AI by Zapier, Zapier Tables, SMS by Zapier"
  category: "Personal Productivity"
  job: "Personal finance"
  source: "https://zapier.com/automations/personal-productivity/personal-finance/investment-tracking/send-top-gainer-stock-alerts-to-your-phone"
---

# Send top gainer stock alerts to your phone

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-top-gainer-stock-alerts-to-your-phone. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** market text is posted to a Webhooks by Zapier catch URL (`webhook`, `hook_raw`). A market-news service, a script or a form posts the raw text to it.
2. **AI by Zapier** reads the text and returns the stock ticker symbols it mentions. Anything that isn't a 1 to 5 letter capital symbol is dropped, and the list is capped at 10.
3. For each ticker, **Zapier Tables** searches the stocks table for a row with the same ticker. If one exists, the ticker is skipped, so you are never alerted twice.
4. For a new ticker, **Zapier Tables** adds a row: the ticker, the market text as notes, and the time it was added.
5. **SMS by Zapier** texts a short alert: the ticker, "top gainer", and a Google search link for it.

One failing ticker does not stop the others. The run's result lists each ticker as `alerted`, `duplicate` or `failed`.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting    | What goes there                                                                                          |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| `TABLE_ID` | The Zapier Tables table that holds your stocks. Look up its ID with the user's Zapier Tables connection. |

Also review the defaults with them: the field keys in `config.ts` must match the table's columns, in order ticker, notes, time (`TICKER_LOOKUP_FIELD` is `f1`, the first field). `MAX_TICKERS` in `workflow.ts` (10) and `SEARCH_URL_PREFIX` (Google search) can change too.

- Which phone number gets the alerts? SMS by Zapier texts the number on the user's `sms` connection, so connect or choose the right one before publishing.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `ai` (AI by Zapier, which uses Zapier-managed models, so no key is needed), `zapier-tables` (the account that owns the stocks table) and `sms` (the phone that gets the alerts) to the user's connections. The webhook trigger needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook-raw.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run before publishing. Use tickers that are not yet in the user's table, or the run will skip them as duplicates:

```json
{
  "body": "Top gainers at the close: ZZTX +24.1%, QQPR +18.7%, Fake text with no tickers in it."
}
```

Check that the stocks table gets one new row per new ticker, with the market text in notes and a time set, that a text arrives on the connected phone for each new ticker, and that the run result lists each ticker as `alerted`. Rerun the same sample and check that each ticker now comes back as `duplicate` with no new row and no text. If run-status tools aren't available, check the result in Zapier Tables directly. The user deletes any test rows, not the agent.

## Notes

- Each alert is a single text; SMS by Zapier cuts messages over 153 characters, so keep the alert short.
- Anyone with the webhook URL can add tickers to the table and trigger texts, so keep the URL private.
- To alert only on big movers, add a price-change or market-cap threshold before the table lookup. To also post to a team channel, add a step after the text.
- After publishing and confirming the trigger is active, give the user the webhook URL to point the market-text sender at.
- Keep real table IDs and phone numbers out of shared copies of this folder.
