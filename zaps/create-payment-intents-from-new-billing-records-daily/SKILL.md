---
name: create-payment-intents-from-new-billing-records-daily
description: Build a Zap on Zapier that creates a Stripe payment intent whenever a billing record with an amount and currency is added or updated in a Zapier Tables table, matching or creating the Stripe customer by email, then writes the intent ID and status back to the record and marks it processed. Use when a finance or billing team logs charges in a table and wants payment intents raised in Stripe without manual entry.
license: MIT
metadata:
  author: zapier
  summary: "When a billing record lands in your Zapier table, a matching Stripe payment intent is created and its ID and status are written back to the record for reconciliation."
  apps: "Zapier Tables, Stripe"
  category: "Finance"
  job: "Payment operations"
  source: "https://zapier.com/automations/finance/payment-operations/payment-processing-management/create-payment-intents-from-new-billing-records-daily"
---

# Create payment intents from new billing records

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-payment-intents-from-new-billing-records-daily. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a record is added or updated in the billing table (`zapier-tables`, `new_or_updated_record`).
2. The run skips the record if it is already processed (the processed checkbox is ticked or a payment intent ID is present), or if it has no positive numeric amount or no three-letter currency.
3. The amount is converted to Stripe's smallest currency unit (×100 for most currencies, ×1 for zero-decimal ones such as JPY, ×1000 for three-decimal ones such as KWD).
4. **Stripe** looks up the customer by the record's customer email. If there is no match, it creates a customer with that email. A record with no customer email gets an intent with no customer.
5. **Zapier Tables** updates the same record with the payment intent ID and status and ticks the processed checkbox. That update fires the trigger again, and the run skips it as already processed.

The Zap creates intents only and never charges a customer unless the user explicitly asks for it.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting            | Where                                                                        | What goes there                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_TABLE_ID` | `config.ts` (`TABLE_ID`) and `triggers/new-or-updated-record.ts`, `table_id` | The Zapier Tables table that holds the billing records. Look it up with the user's Zapier Tables connection; one answer fills both places |

Also review the defaults with them:

- `CUSTOMER_REF_FIELD` (`f1`): the customer's email. The Zap matches Stripe customers by email.
- `AMOUNT_FIELD` (`f2`): the amount in major units (49.99). The code assumes major units, not cents.
- `CURRENCY_FIELD` (`f3`), `DESCRIPTION_FIELD` (`f4`): the three-letter currency code and an optional description.
- `PAYMENT_INTENT_ID_FIELD` (`f5`), `PAYMENT_STATUS_FIELD` (`f6`), `PROCESSED_FIELD` (`f7`): where the write-back goes. `PROCESSED_FIELD` must be a checkbox.
- `CONFIRM_PAYMENT` (`false`): `false` creates intents only.

The `f1` to `f7` values are Tables field keys, not field names. Read the real keys from the trigger's sample record (`new.data`) or from the Update Record action's `new__data__fN` inputs.

Before turning it on, confirm with the user:

- The billing table has the write-back fields (payment intent ID, payment status, processed checkbox). If it doesn't, offer to add them.
- Use a test-mode Stripe account first.
- Intents should be created but not charged. Set `CONFIRM_PAYMENT` to `true` only on the user's explicit say-so.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `stripe` (use a test-mode account first) and `zapier-tables` (the account that owns the billing table) to the user's connections. The Stripe and Zapier Tables actions use them. No other apps need a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-or-updated-record.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Use a **test-mode** Stripe connection. Run it once as a draft test run (`run_workflow_draft` in Zapier MCP) with a test record shaped like this:

```json
{
  "record_id": "test-record-0001",
  "table_id": "test-table-0001",
  "new": {
    "id": "test-record-0001",
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

Check that a payment intent for 1250 (USD) appears in the Stripe test dashboard with status `requires_payment_method`, and that the test record now has its ID, its status and the processed box ticked. Run the same input again: it must skip as `already-processed`. A record with an empty amount must skip as `missing-amount-or-currency`.

If run-status tools aren't available, check the result in Stripe and Zapier Tables directly. Ask the user to delete the test intent and test record, since the agent doesn't delete test data. Then publish and confirm the trigger is active.

## Notes

- Despite "daily" in the name, the trigger is New or Updated Record, so each record is processed as it changes, not in a daily batch.
- If Stripe fails, the run fails and nothing is written back, so the record stays unprocessed and is picked up on its next edit.
- Editing a processed record does nothing; clear the payment intent ID and untick processed to raise a new intent.
- The amount is rounded to the nearest smallest unit; Stripe's minimum charge (about $0.50) still applies.
- To customize: skip records below a minimum amount or with no customer reference, or send a notification or create a task when intent creation fails so billing staff can follow up.
- Never commit a real table ID. A live Stripe connection creates real customers and intents.
