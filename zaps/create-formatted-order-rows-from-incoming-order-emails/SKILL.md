---
name: create-formatted-order-rows-from-incoming-order-emails
description: Build a Zap on Zapier that reads order confirmation emails from Gmail, pulls out the order, customer, address and payment fields, and appends one cleaned row per paid order to a master orders sheet, skipping orders already in it. Use when a shop or service business gets order confirmations by email and wants them logged as tidy rows in a spreadsheet without retyping.
license: MIT
metadata:
  author: zapier
  summary: "Each order confirmation email becomes one tidy row in your orders sheet, with the customer, address and amount filled in and duplicates skipped."
  apps: "Gmail, Google Sheets"
  category: "Data & Analytics"
  job: "Data operations"
  source: "https://zapier.com/automations/data-analytics/data-operations/data-quality-management/create-formatted-order-rows-from-incoming-order-emails"
---

# Create formatted order rows from incoming order emails

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-formatted-order-rows-from-incoming-order-emails. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new Gmail email matching the search in `GMAIL_QUERY`, by default `subject:"order confirmation" in:inbox` (`gmail`, `search`).
2. **Code:** reads the order reference from the subject (`#<id>`), falling back to an `Order number:` line in the body. Skips the email if it mentions onboarding, course, registration or newsletter, or if it has no order reference and no total.
3. **Code:** reads the customer's name, email, phone, address lines, business and total from labelled lines in the body. Splits the name into first and last, turns `$`, `£` or `€` into `USD`, `GBP` or `EUR`, and makes the amount a number.
4. **Google Sheets** looks up the order reference in the orders sheet. If a row already has it, the run stops and writes nothing.
5. **Google Sheets** appends one row with the parsed fields, the sender's address in Source, and the time it was logged.

A row already in the sheet is never updated.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting          | What goes there                                                                    |
| ---------------- | ---------------------------------------------------------------------------------- |
| `SPREADSHEET_ID` | The orders sheet: the long ID in its URL. Look it up from the sheet the user names |

Also review the defaults with them: `GMAIL_QUERY` (narrow it to the sender or subject their shop uses), `WORKSHEET_ID` (`"0"` is the first tab), and in `workflow.ts`, `COLUMNS` (the code writes thirteen columns, A to M, in that order; map their headers to those letters), `EXCLUDE_PATTERN` and `CURRENCY_SYMBOLS`.

Before turning it on, confirm:

- Which Gmail account receives the order confirmations, and does the default search match their subject or sender?
- What does a real order confirmation look like? The parser reads labels like `Order number:`, `Email:`, `Total:` and `Address line 1:`. If the email uses other labels, change them in the code before going live.
- Is an order "paid" when it has a total, or do they need a payment-status check? The default counts any email with an order reference and a total.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` (the Google account that owns the orders sheet) to the user's connection. The trigger uses `gmail` (the Gmail account that receives the order emails). The parsing code needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/search.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a test sheet as the orders sheet, so the row lands there, not in the real one:

```json
{
  "subject": "Order confirmation #IT-ORD-900001",
  "body_plain": "Order number: IT-ORD-900001\nName: Pat Example\nEmail: pat@example.com\nPhone: 555-0100\nAddress line 1: 1 Test Street\nAddress line 2: Suite 2\nBusiness: example.com\nTotal: $1,250.00",
  "from": { "name": "Test Shop", "email": "orders@example.com" },
  "from__email": "orders@example.com"
}
```

Check that one row appears with the order ID, name split into first and last, phone, address lines, business, `USD`, the amount as `1250`, the sender in Source and a logged-at time. Run the same sample again: it should finish with `reason: "duplicate-order"` and add no row. If run-status tools aren't available, check the result in Google Sheets directly. Then publish, confirm the trigger is active, and give the user the workflow's link. Ask the user to delete the test row, not the agent.

## Notes

- The parser is simple: it reads labelled lines, not the whole email layout. Check it against a few real order emails before trusting it.
- Only the first matching row is checked for a duplicate.
- To alert billing staff on high-value orders, add a Slack or email step after the row is written, for amounts above a threshold. To tag rows by product type, add a column set from the subject or body.
- Don't commit a real spreadsheet ID. Anyone with access to the sheet can read the orders in it.
