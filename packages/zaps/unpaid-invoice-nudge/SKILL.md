---
name: unpaid-invoice-nudge
description: Build a Zapier Next Gen Zap that follows up on every new invoice. 3 days after the due date, if it's still unpaid, AI writes a short, polite reminder in the owner's voice and Gmail sends it to the customer. On day 7, if it's still unpaid, SMS by Zapier texts the owner who owes what. Use when a service business owner wants invoices chased without doing it by hand. Works with QuickBooks Online, or any billing tool that can send a webhook.
metadata:
  author: andrewckor
  summary: "Three days after an invoice is due, the customer gets a friendly reminder in your voice. Still unpaid on day 7, you get a text."
  apps: "QuickBooks Online, Webhooks by Zapier, AI by Zapier, Gmail, SMS by Zapier"
  category: "Finance"
  job: "Accounts receivable"
---

# Unpaid invoice nudge

## What it does

1. **Trigger:** QuickBooks Online **New Invoice**. For any other billing tool (Stripe, FreshBooks, Square, a form, a spreadsheet), use a Webhooks by Zapier **Catch Hook** instead. One trigger per workflow; the code handles both payload shapes, including messy field names.
2. **Wait** (a durable `ctx.wait`, the run is saved while it waits) until **3 days after the due date**.
3. **Check the invoice again.** QuickBooks path: **Find Invoice** by id, unpaid while `Balance > 0`. Webhook path: see "Webhook status check" below. **Paid means the run stops.**
4. **AI by Zapier** writes a short, polite reminder in the owner's voice with the customer's first name, invoice number, amount, due date and pay link. No guilt trip, no invented links.
5. **Gmail** sends it to the customer from the owner's address.
6. **Wait 4 more days** (day 7 for an invoice that was on time) and **check again**. Paid means stop. An invoice that was already overdue still gets the full 4 days after its reminder before the owner is texted.
7. **Still unpaid:** **SMS by Zapier** texts the owner, e.g.
   ```
   Dana K. still owes $480 on #1042, 7 days late.
   ```

Sample reminder email (from a real test run):

```
Subject: Friendly reminder: Invoice #1042

Hi Dana,

I wanted to send a quick reminder that invoice #1042 for $480 was due Oct 13. I know these things can slip through the cracks. You can pay here:
https://pay.example.com/i/1042

Thanks,
Sam
```

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names. Without Zapier MCP, the Zapier SDK CLI works too (`npx skills add zapier/agent-skills --skill workflows-create`).

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger, pick one** (one per workflow):
   - **QuickBooks Online:** New Invoice (`quickbooks`, `invoice_v2`, no params), authenticated with the user's QuickBooks Online connection.
   - **Any other billing tool:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). No connection, so `authentication_id` is `null`. The billing tool POSTs the invoice as JSON (customer name, customer email, invoice number, amount or balance due, due date, pay link, status).
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the Gmail account the reminders go out from. Always required.
   - `sms`: SMS by Zapier (the owner's verified number). Always required.
   - `quickbooks`: **required on the QuickBooks path** (used by Find Invoice, search `invoice`). Not needed on the webhook path.
   - AI by Zapier needs no connection. `authentication_id: "0"` in the code means Zapier's managed AI credentials; leave it as is.
3. **Constants:** set the ones under "Ask the user".
4. Test with the steps below, then publish. If using the catch hook, wait until the trigger is active and give the user their webhook URL.

## Ask the user

- Where do invoices live: QuickBooks Online, or another tool that can send a webhook?
- Which Gmail account should the reminders come from? (the Gmail connection, plus `BUSINESS_NAME` as the from name)
- How do you sign and sound? (`OWNER_NAME`, `OWNER_VOICE`, e.g. "Maria, owner. Warm, direct, first names, no fluff.")
- Which phone gets the day-7 text? (Set it in the SMS by Zapier connection, not in the code.)
- Are 3 days (email) and 7 days (text) after the due date right? (`REMIND_AFTER_DAYS`, `ESCALATE_AFTER_DAYS`)
- This follows invoices created after it's turned on. Invoices that are already overdue are not chased; say so, and offer the daily-schedule option in Notes if they need that.

## Webhook status check

The webhook path has no app to re-check, so pick one:

- **Default:** the run uses the status the webhook sent (`status: "paid"` or a balance of 0 stops it). Good for tools that only fire on unpaid invoices.
- **Better:** set `STATUS_CHECK_URL` (or send `status_url` in the payload) to a URL that returns the invoice's current status as JSON, like `{"balance": 0}` or `{"status": "paid"}`. `{invoice}` in the URL is replaced with the invoice id or number. Both checks call it.
- **Or:** use your billing tool's own Zapier "find invoice" search in place of the check step, the same way the QuickBooks path does.

## Test

### 1. Webhook sample

Run each sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Posting it to the webhook URL only works once the workflow is published.

Run the workflow with these two payloads (field names messy on purpose). `remind_wait_seconds` and `escalate_wait_seconds` shorten both waits to 60 seconds; leave them out in real use. Use your own email address as the customer email.

```json
{
  "Customer": "Dana Kowalski",
  "cust e-mail": "you@example.com",
  "Invoice #": "1042",
  "Amt Due": "$480.00",
  "due": "2026-10-13",
  "pay here": "https://pay.example.com/i/1042",
  "Status": "open",
  "remind_wait_seconds": 60,
  "escalate_wait_seconds": 60
}
```

```json
{
  "client": "Dana Kowalski",
  "email_addr": "you@example.com",
  "inv_no": "#1043",
  "total": "480",
  "Due Date": "Oct 13, 2026",
  "payment_link": "https://pay.example.com/i/1043",
  "status": "Paid",
  "remind_wait_seconds": 60,
  "escalate_wait_seconds": 60
}
```

Expect: the unpaid one waits, checks, drafts, emails the reminder to your inbox, waits again, checks, and texts the owner `Dana K. still owes $480 on #1042, N days late.` The paid one waits, checks, and stops with `paid before reminder`: no email, no text.

### 2. Real test from QuickBooks Online

The webhook sample proves the logic, not the QuickBooks trigger or Find Invoice.

1. Connect QuickBooks Online in Zapier (a QuickBooks sandbox company from the Intuit Developer portal is ideal, so no real customer gets an email).
2. Create a test customer whose email is your own address, then an invoice for them with a due date in the past.
3. Pull it with the trigger's test / "find new records", and run the workflow on that record with `remind_wait_seconds` and `escalate_wait_seconds` added as 60.
4. Then mark the invoice paid, run it again, and confirm it stops at the first check.
5. Only call it done when this real run passes.

## Customize

- **Timing:** `REMIND_AFTER_DAYS` (default 3) and `ESCALATE_AFTER_DAYS` (default 7), both counted from the due date
- **No pay link?** QuickBooks only includes `InvoiceLink` when online payments are on. Without one, the email tells the customer to reply for payment options.
- **A second reminder to the customer:** copy the draft and email steps after the second wait, with a firmer tone

## Notes

- **Only new invoices.** The trigger fires when an invoice is created, so invoices that are already overdue when the user turns this on are never chased. To cover them, run it on a daily schedule that searches QuickBooks for overdue invoices instead (not built here).
- Paid at either check means the run stops. Nothing goes out for paid invoices.
- The waits are durable: the run is saved and resumes on time.
- A reminder needs a customer email on the invoice. Without one, the run stops with `no customer email on the invoice`.
- SMS by Zapier texts only the verified owner number. Use Twilio or OpenPhone to text customers.
- Never commit a real webhook URL, email address or phone number.
