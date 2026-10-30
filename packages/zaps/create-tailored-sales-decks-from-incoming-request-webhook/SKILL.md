---
name: create-tailored-sales-decks-from-incoming-request-webhook
description: Build a Zapier Next Gen Zap that turns an incoming sales request into a branded Google Slides deck, filled from the request and the matching account record in Zapier Tables. Use when a sales team wants a tailored proposal or pitch deck generated automatically from a form, CRM or script submission, with duplicate requests skipped.
metadata:
  author: zapier
  summary: "When a sales request comes in, a tailored deck is built from a template with the client's details and saved for the deal team, and repeat requests are skipped."
  apps: "Webhooks by Zapier, Storage by Zapier, Zapier Tables, Google Slides"
  category: "Sales"
  job: "Sales enablement"
  source: "https://zapier.com/automations/sales/sales-enablement/sales-content-management/create-tailored-sales-decks-from-incoming-request-webhook"
---

# Create tailored sales decks from incoming request webhook

## What it does

1. **Trigger:** a sales request arrives at a Webhooks by Zapier catch hook (a form, CRM or script posts to it). The request ID, from `submission_id` or the URL's `id`, is the dedupe key.
2. **Storage by Zapier** checks for a key built from the request ID. If the key already exists, the run stops and no second deck is made.
3. **Zapier Tables** looks up the account or opportunity record whose request-ID column matches. If none matches, a new record is created with the client name and a status.
4. **Plain text cleanup** (no app step) trims the agenda, pricing summary and next steps, and title-cases the client name. The deck title defaults to the client name and the run date.
5. **Google Slides** copies the shared template and fills its placeholders with the title, client name, agenda, pricing summary and next steps.
6. **Storage by Zapier** saves the request key with the new deck's ID, so a later repeat of the same request is skipped.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `storage`: the user's Storage by Zapier connection.
   - `zapier-tables`: the user's Zapier Tables connection, for the table that holds account and opportunity records.
   - `google-slides`: the user's Google Slides connection, for the account that owns the template and will own the decks.
3. **Constants:**
   - `TEMPLATE_PRESENTATION_ID`: the long ID in the template deck's URL.
   - `TABLE_ID`: the Zapier Tables table to search and write.
   - `REQUEST_ID_FIELD`, `CLIENT_NAME_FIELD`, `STATUS_FIELD`: column keys such as `new__data__f2`, not column names. Map the table's columns to these keys.
   - `NEW_RECORD_STATUS`: the status written to a new record.
   - `SHARE_DECK_WITH_LINK`: `false` keeps each deck private to the connected Google account. Set it to `true` only if anyone with the link should see it.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point the request sender at.

## Ask the user

- Which Zapier Tables table holds the account or opportunity records, and which columns hold the request ID, client name and status?
- Which Google Slides deck is the template, and which placeholder names does it use (for example `{{client_name}}`, `{{agenda}}`, `{{pricing_summary}}`, `{{next_steps}}`)? The action's fields are generated from the template, so match them after connecting Google Slides.
- What does the request sender post? The workflow reads `submission_id` (or `id`), `client_name`, `presentation_title`, `agenda`, `pricing_summary` and `next_steps`. If the sender uses other names, change those keys in the input schema before installing.
- Should decks be shared with anyone who has the link?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, with a request ID that has no matching key in Storage by Zapier:

```json
{
  "submission_id": "REQ-1001",
  "client_name": "acme corp",
  "presentation_title": "",
  "agenda": "Platform overview\n  Pricing review",
  "pricing_summary": "Enterprise tier, annual billing",
  "next_steps": "Schedule security review"
}
```

Check that a new deck appears in the connected Google Drive from the template, with the title and the client name filled in and the agenda, pricing and next steps in their placeholders. Check that a Zapier Tables record exists with the request ID. Then run the same sample again and check that the run stops at the Storage check and creates no second deck. Remove any test deck and test record afterwards.

## Customize

- **Hand off the deck:** send the presentation link to the CRM owner or a deal channel after the deck is made.
- **Localize:** add extra text steps to format dates and currency for each region.
- **Swap sections by deal tier:** choose a different template, or different slide sections, based on a tier field in the request.

## Notes

- Each run creates a Google Slides deck, so every run that passes the Storage check uses one deck of your Google quota.
- Storage keys are limited to 32 characters, so the request ID is truncated in the key if it is longer.
- Any request ID without a matching key creates a Zapier Tables record, so check the table for duplicates if the same account is submitted under different IDs.
- Never commit a real template ID, table ID or webhook URL. Anyone with the webhook URL can create decks in your account.
