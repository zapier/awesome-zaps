---
name: create-payment-intents-from-new-billing-records-daily
description: Build a Zapier Next Gen Zap that creates a Stripe payment intent whenever a billing record with an amount and currency is added or updated in a Zapier Tables table, matching or creating the Stripe customer by email, then writes the intent ID and status back to the record and marks it processed. Use when a finance or billing team logs charges in a table and wants payment intents raised in Stripe without manual entry.
metadata:
  author: zapier
  summary: "When a billing record lands in your Zapier table, a matching Stripe payment intent is created and its ID and status are written back to the record for reconciliation."
  apps: "Zapier Tables, Stripe"
  category: "Finance"
  job: "Payment operations"
  source: "https://zapier.com/automations/finance/payment-operations/payment-processing-management/create-payment-intents-from-new-billing-records-daily"
---

# Create payment intents from new billing records

## What it does

1. **Trigger:** a record is added or updated in the billing table (Zapier Tables, New or Updated Record).
2. The run skips the record if it is already processed (the processed checkbox is ticked or a payment intent ID is present), or if it has no positive numeric amount or no three-letter currency.
3. The amount is converted to Stripe's smallest currency unit (×100 for most currencies, ×1 for zero-decimal ones such as JPY, ×1000 for three-decimal ones such as KWD).
4. **Stripe** looks up the customer by the record's customer email. If there is no match, it creates a customer with that email. A record with no customer email gets an intent with no customer.
5. **Zapier Tables** updates the same record with the payment intent ID and status and ticks the processed checkbox. That update fires the trigger again, and the run skips it as already processed.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Zapier Tables, New or Updated Record (`zapier-tables`, `new_or_updated_record`), with `params: { table_id: <TABLE_ID> }` and the Zapier Tables connection as its `authentication_id`.
2. **Connections** (each alias in the code is the app's slug):
   - `zapier-tables`: the user's Zapier Tables connection, for the account that owns the billing table.
   - `stripe`: the user's Stripe connection. Use a test-mode account first.
3. **Constants:**
   - `TABLE_ID`: the billing table's ID, from its URL.
   - `CUSTOMER_REF_FIELD`, `AMOUNT_FIELD`, `CURRENCY_FIELD`, `DESCRIPTION_FIELD`, `PAYMENT_INTENT_ID_FIELD`, `PAYMENT_STATUS_FIELD`, `PROCESSED_FIELD`: Tables field keys such as `f1`, not field names. Read them from the trigger's sample record (`new.data`) or from the Update Record action's `new__data__fN` inputs. The processed field must be a checkbox.
   - `CONFIRM_PAYMENT`: `false` creates intents only. `true` makes Stripe try to charge immediately, so only set it on the user's explicit say-so.
4. Test with the steps below, then publish and wait until the trigger is active.

## Ask the user

- Which table holds the billing records, and which fields hold the customer email, amount, currency and description? If they don't have the write-back fields (payment intent ID, payment status, processed checkbox), offer to add them.
- Is the amount stored in major units (49.99) or already in cents? The code assumes major units.
- Should intents be confirmed (charged) immediately? The default is no.
- Is the customer reference an email address? The code matches Stripe customers by email; a Stripe customer ID needs `selection: "id"` instead.

## Test

Use a **test-mode** Stripe connection. Add a record to the table and run it as a draft test run (`run_workflow_draft` in Zapier MCP) with the trigger's record, shaped like this:

```json
{
  "record_id": "YOUR_RECORD_ID",
  "table_id": "YOUR_TABLE_ID",
  "new": {
    "id": "YOUR_RECORD_ID",
    "data": {
      "f1": "customer@example.com",
      "f2": 12.5,
      "f3": "usd",
      "f4": "[install-test] Invoice 1001",
      "f5": null,
      "f6": null,
      "f7": false
    }
  }
}
```

Check that a payment intent for 1250 (USD) appears in the Stripe test dashboard with status `requires_payment_method`, and that the record now has its ID, its status and the processed box ticked. Then run the same input again: it must skip as `already-processed`. A record with an empty amount must skip as `missing-amount-or-currency`.

## Customize

- **Minimum amount and required customer:** skip records below a minimum amount or with no customer reference.
- **Alert on failure:** when intent creation fails, send a notification or create a task so billing staff can follow up.

## Notes

- Despite "daily" in the name, the spec's trigger is New or Updated Record, so each record is processed as it changes, not in a daily batch.
- If Stripe fails, the run fails and nothing is written back, so the record stays unprocessed and will be picked up on its next edit.
- Editing a processed record does nothing; clear the payment intent ID and untick processed to raise a new intent.
- The amount is rounded to the nearest smallest unit; Stripe's minimum charge (about $0.50) still applies.
- Never commit a real table ID. A live Stripe connection creates real customers and intents.
