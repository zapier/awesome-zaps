---
name: send-top-gainer-stock-alerts-to-your-phone
description: Build a Zapier Next Gen Zap that reads market text posted to a webhook, pulls out stock ticker symbols with AI, saves each new ticker to a Zapier Tables stocks table, and texts you a short alert with a search link. Use when you want top-gainer or market-mover alerts on your phone without checking a feed, and a record of which tickers you've already been alerted about.
metadata:
  author: zapier
  summary: "When market text arrives, each new stock ticker in it is saved to your stocks table and texted to your phone with a search link, so you see movers without checking a feed."
  apps: "Webhooks by Zapier, AI by Zapier, Zapier Tables, SMS by Zapier"
  category: "Personal Productivity"
  job: "Personal finance"
  source: "https://zapier.com/automations/personal-productivity/personal-finance/investment-tracking/send-top-gainer-stock-alerts-to-your-phone"
---

# Send top gainer stock alerts to your phone

## What it does

1. **Trigger:** market text is posted to a Webhooks by Zapier catch URL (a market-news service, a script or a form posts the raw text to it).
2. **AI by Zapier** reads the text and returns the stock ticker symbols it mentions, as a comma-separated list. Anything that isn't a 1 to 5 letter capital symbol is dropped, and the list is capped at 10.
3. For each ticker, **Zapier Tables** searches your stocks table for a row with the same ticker. If one exists, the ticker is skipped, so you are never alerted twice.
4. For a new ticker, **Zapier Tables** adds a row: the ticker, the market text as notes, and the time it was added.
5. **SMS by Zapier** texts a short alert to your connected phone number: the ticker, "top gainer", and a Google search link for the ticker.

One failing ticker does not stop the others. The run's result lists each ticker as `alerted`, `duplicate` or `failed`.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Raw Hook (`webhook`, `hook_raw`). It needs no connection, so its `authentication_id` is `null`. The raw body is read as the market text.
2. **Connections** (each alias in the code is the app's slug):
   - `ai`: AI by Zapier. The model is Zapier-managed (`authentication_id: "0"`), so no key is needed.
   - `zapier-tables`: Zapier Tables, the account that owns the stocks table.
   - `sms`: SMS by Zapier. It texts the phone number on that connection, so no recipient is set in the code.
3. **Constants:**
   - `TABLE_ID`: the ID of your stocks table in Zapier Tables.
   - `TICKER_LOOKUP_FIELD`, `TICKER_FIELD`, `NOTES_FIELD`, `TIME_FIELD`: the field keys for the table's ticker, notes and time columns. Set these from your table; `f1` is the first field on a table and `new__data__f1` is how a new row's first field is written.
   - `MAX_TICKERS`: the most tickers handled per message. Defaults to `10`.
   - `SEARCH_URL_PREFIX`: the search page the ticker link opens. Defaults to Google search.
   - `TICKER_PROMPT`: the instruction given to the AI step.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point the market-text sender at.

## Ask the user

- Which Zapier Tables table is the stocks table, and which of its fields hold the ticker, notes and time? Enter the table ID and field keys as constants.
- Which phone number should get the alerts? SMS by Zapier texts the number on its own connection; connect or choose the right one.
- Should the search link go to a different site than Google?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use tickers that are not yet in the user's table, or the run will skip them as duplicates:

```json
{
  "body": "Top gainers at the close: ZZTX +24.1%, QQPR +18.7%, Fake text with no tickers in it."
}
```

Check that the stocks table gets one new row per new ticker, with the market text in notes and a time set, that a text arrives on the connected phone for each new ticker, and that the run result lists each ticker as `alerted`. Rerun the same sample and check that each ticker now comes back as `duplicate` with no new row and no text. Then tell the user to delete the test rows if they are real data.

## Customize

- **Only big movers:** add a price-change or market-cap threshold, checked before the table lookup, so only significant movers trigger alerts.
- **Team channel:** post the same summary to a team channel, instead of or as well as SMS, as an extra step after the text.

## Notes

- Each alert is a single text; SMS by Zapier cuts messages over 153 characters, so keep the alert short.
- Anyone with the webhook URL can post market text into your table and trigger texts. Keep the URL private.
- Never commit a real table ID or phone number to a shared copy of this file.
