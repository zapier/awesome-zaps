---
name: unpaid-invoice-nudge
description: Build a Zap on Zapier that follows up on every new invoice. 3 days after the due date, if it's still unpaid, AI writes a short, polite reminder in the owner's voice and Gmail sends it to the customer. On day 7, if it's still unpaid, SMS by Zapier texts the owner who owes what. Use when a service business owner wants invoices chased without doing it by hand. Works with QuickBooks Online, or any billing tool that can send a webhook.
license: MIT
metadata:
  author: andrewckor
  summary: "Three days after an invoice is due, the customer gets a friendly reminder in your voice. Still unpaid on day 7, you get a text."
  apps: "QuickBooks Online, Webhooks by Zapier, AI by Zapier, Gmail, SMS by Zapier"
  category: "Finance"
  job: "Accounts receivable"
---

# Unpaid invoice nudge

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/unpaid-invoice-nudge. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new invoice in `quickbooks` (`invoice_v2`), or a `webhook` catch hook (`hook_v2`) for any other billing tool. The code handles both payload shapes, including messy field names.
2. **Wait** (a durable `ctx.wait`, the run is saved while it waits) until **3 days after the due date**.
3. **Check the invoice again.** QuickBooks path: `quickbooks` search `invoice` by id, unpaid while `Balance > 0`. Webhook path: see "Ask the user". **Paid means the run stops.**
4. **`ai`** writes a short, polite reminder in the owner's voice with the customer's first name, invoice number, amount, due date and pay link.
5. **`gmail`** sends it to the customer from the owner's address.
6. **Wait 4 more days** (day 7 for an invoice that was on time) and **check again**. Paid means stop. An invoice already overdue still gets the full 4 days after its reminder before the owner is texted.
7. **Still unpaid:** `sms` texts the owner, e.g. `Dana K. still owes $480 on #1042, 7 days late.`

The reminder never invents a link, amount or date, and nothing goes out for a paid invoice.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting            | Where              | What goes there                                                                                                                                                                                                       |
| ------------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Billing tool       | Build, step 2      | QuickBooks Online, or any other tool that can POST a webhook                                                                                                                                                          |
| Gmail account      | `gmail` connection | The Gmail account the reminders go out from                                                                                                                                                                           |
| Owner's phone      | `sms` connection   | The owner's verified number, which gets the day-7 text. SMS by Zapier texts only this number                                                                                                                          |
| `OWNER_NAME`       | `workflow.ts`      | The name the reminder is signed with                                                                                                                                                                                  |
| `BUSINESS_NAME`    | `workflow.ts`      | The sender name on the reminder email                                                                                                                                                                                 |
| `OWNER_VOICE`      | `workflow.ts`      | How the reminder should sound, e.g. "Warm, direct, first names, no fluff"                                                                                                                                             |
| `STATUS_CHECK_URL` | `config.ts`        | Webhook path only, optional: a URL that returns the invoice's current status as JSON, like `{"balance": 0}`. `{invoice}` in it is replaced with the invoice id or number. Empty means use the status the webhook sent |

Also review the defaults with them: `REMIND_AFTER_DAYS` (3) and `ESCALATE_AFTER_DAYS` (7), both counted from the due date in `workflow.ts`.

Before turning it on, confirm this follows invoices created after it's turned on. Invoices that are already overdue are not chased. Say so, and see Notes for the daily-schedule option.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` (the account the reminders go out from), `sms` (the owner's verified number) and `quickbooks` (QuickBooks path only: used by the invoice search). `ai` and `webhook` need no connection. Keep `authentication_id: "0"` on `ai`, which uses Zapier's managed AI credentials.
2. **Source:** publish `workflow.ts` and `config.ts`, with each per-person value replaced by the user's answer. `connections/` is a setting, not code: set the workflow's connection bindings from it. This zap has no `triggers/` folder, so pick the trigger with the user:
   - QuickBooks Online: `quickbooks`, `invoice_v2`, no params, on the user's QuickBooks connection.
   - Any other billing tool: `webhook`, `hook_v2`, with no connection, so `authentication_id` is `null`. The billing tool POSTs the invoice as JSON: customer name, customer email, invoice number, amount or balance due, due date, pay link and status.

   For the trigger's `selected_api`, call `search_triggers` with the app's slug, find the row whose `key` is the event, and use `<app_key>@<app_version>` from it.

3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow. On the webhook path, wait until the trigger is active and give the user their webhook URL.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if using QuickBooks) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run the two samples below as draft test runs before publishing, with `run_workflow_draft`. Posting to the webhook URL only works once the workflow is published. The field names are messy on purpose. `remind_wait_seconds` and `escalate_wait_seconds` shorten both waits to 60 seconds; leave them out in real use. Use your own email address as the customer email.

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

Expect: the unpaid one waits, checks, drafts, emails the reminder to your inbox, waits again, checks, and texts the owner `Dana K. still owes $480 on #1042, N days late.` The paid one waits, checks, and stops with `paid before reminder`: no email, no text. If run-status tools aren't available, check the result in Gmail and the owner's messages directly.

For the QuickBooks path, run once against a QuickBooks sandbox company so no real customer gets an email. Create a test customer with your own email address and an invoice with a due date in the past, then run the workflow on it with both wait fields set to 60. Mark the invoice paid, run it again, and confirm it stops at the first check.

Ask the user to delete the test emails, texts and invoices. The agent does not delete test data.

## Notes

- **Only new invoices.** The trigger fires when an invoice is created, so invoices already overdue when this is turned on are never chased. To cover them, a daily scheduled run that searches QuickBooks for overdue invoices would do it (not built here).
- Paid at either check stops the run. The waits are durable: the run is saved and resumes on time.
- A reminder needs a customer email on the invoice. Without one, the run stops with `no customer email on the invoice`.
- No pay link? QuickBooks only includes one when online payments are on. Without one, the email asks the customer to reply for payment options.
- A second reminder to the customer: copy the draft and email steps after the second wait, with a firmer tone.
- For the webhook path, a billing tool's own Zapier "find invoice" search can replace the status URL check.
- SMS by Zapier texts only the verified owner number. Use Twilio or OpenPhone to text customers.
- Never commit a real webhook URL, email address or phone number.
