---
name: create-formatted-order-rows-from-incoming-order-emails
description: Build a Zapier Next Gen Zap that reads order confirmation emails from Gmail, pulls out the order, customer, address and payment fields, and appends one cleaned row per paid order to a master orders sheet, skipping orders already in it. Use when a shop or service business gets order confirmations by email and wants them logged as tidy rows in a spreadsheet without retyping.
metadata:
  author: zapier
  summary: "Each order confirmation email becomes one tidy row in your orders sheet, with the customer, address and amount filled in and duplicates skipped."
  apps: "Gmail, Google Sheets"
  category: "Data & Analytics"
  job: "Data operations"
  source: "https://zapier.com/automations/data-analytics/data-operations/data-quality-management/create-formatted-order-rows-from-incoming-order-emails"
---

# Create formatted order rows from incoming order emails

## What it does

1. **Trigger:** a new Gmail email that matches the search `subject:"order confirmation" in:inbox`.
2. **Code:** reads the order reference from the subject (`#<id>`), falling back to an `Order number:` line in the body. Skips the email if it mentions onboarding, course, registration or newsletter, or if it has no order reference and no total.
3. **Code:** reads the customer's name, email, phone, address lines, business and total from labelled lines in the body. Splits the name into first and last, turns `$`, `£` or `€` into `USD`, `GBP` or `EUR`, and makes the amount a number.
4. **Google Sheets** looks up the order reference in the orders sheet. If a row already has it, the run stops and writes nothing.
5. **Google Sheets** appends one row with the parsed fields, the sender's address in Source, and the time it was logged.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Gmail, New Email Matching Search (`gmail`, key `search`). Its `authentication_id` is the Gmail connection.
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the Gmail account that receives the order emails.
   - `google-sheets`: the Google account that owns the orders sheet.
3. **Constants:**
   - `GMAIL_QUERY`: the Gmail search for order confirmations. Narrow it to the sender or the subject your shop uses.
   - `SPREADSHEET_ID`: the long ID in the orders sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `COLUMNS`: column keys such as `COL$A`, not header names. Map your headers to their letters. The code writes thirteen columns, A to M.
   - `EXCLUDE_PATTERN`: words that mark an email as not an order.
   - `CURRENCY_SYMBOLS`: symbols to currency codes; add any others you take.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the workflow's link.

## Ask the user

- Which Gmail account receives the order confirmations, and what subject or sender do they use? The default search is `subject:"order confirmation"`.
- Which sheet and tab are the orders, and which columns hold each field? The code expects the thirteen columns in `COLUMNS`, in that order.
- What does a real order confirmation look like? The parser reads labels like `Order number:`, `Email:`, `Total:` and `Address line 1:`. If the email uses other labels, change them in the code before going live.
- Is an order "paid" when it has a total, or do they need a payment-status check? The default counts any email with an order reference and a total.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. It uses a test sheet, so the row lands there, not in the orders sheet:

```json
{
  "subject": "Order confirmation #IT-ORD-900001",
  "body_plain": "Order number: IT-ORD-900001\nName: Pat Example\nEmail: pat@example.com\nPhone: 555-0100\nAddress line 1: 1 Test Street\nAddress line 2: Suite 2\nBusiness: example.com\nTotal: $1,250.00",
  "from": { "name": "Test Shop", "email": "orders@example.com" },
  "from__email": "orders@example.com"
}
```

Confirm that a row appears with the order ID, name split into first and last, phone, address lines, business, `USD`, the amount as `1250`, the sender in Source and a logged-at time. Run the same sample again: it should finish with `reason: "duplicate-order"` and add no row. Then tell the user to delete the test row if it was real data.

## Customize

- **Alert billing staff for high-value orders:** add a Slack or email step after the row is written, for amounts above a threshold you choose.
- **Tag rows by event group or product type:** add a column and set it from the subject or the body.

## Notes

- The parser is simple: it reads labelled lines, not the whole email layout. Check it against a few real order emails before trusting it.
- Only the first matching row is checked for a duplicate; an order reference that already exists is never updated.
- The code reads `subject`, `body_plain` and `from` as shown in the trigger's output schema.
- Never commit a real spreadsheet ID. Anyone with access to the sheet can read the orders in it.
