---
name: update-loan-records-from-external-loan-status-feed
description: Build a Zapier Next Gen Zap that takes a loan status update from an external feed by webhook, finds the matching loan in Salesforce by its external loan ID, and updates the loan's status, property, finance and date fields. Use when a loan servicer or feed pushes loan status changes and the CRM loan records should stay current without manual edits. Does not create new loans.
metadata:
  author: zapier
  summary: "When the loan servicer sends a status change, the matching loan in your CRM is updated with the new status, dates, property and finance figures, so the team sees current loan data."
  apps: "Webhooks by Zapier, Salesforce"
  category: "Finance"
  job: "Loan management"
  source: "https://zapier.com/automations/finance/loan-management/loan-servicing/update-loan-records-from-external-loan-status-feed"
---

# Update loan records from external loan status feed

## What it does

1. **Trigger:** a loan status update arrives at a Webhooks by Zapier catch hook (the loan feed posts to it).
2. **Salesforce Find Record** looks up the loan whose external loan ID field matches `loan_id` in the payload. If there is no match, the run stops and writes nothing. It never creates a loan.
3. **Plain code** skips the run unless the payload carries a status or a next-payment or maturity date. It then normalizes dates to `YYYY-MM-DD` and currency and rate strings to numbers.
4. **Salesforce Update Record (UTC)** writes the status, property address, principal balance, interest rate and key dates onto the found loan.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `salesforce`: the user's Salesforce connection for the account that owns the loan records.
3. **Constants** (all at the top of `workflow.ts`):
   - `LOAN_OBJECT`: the Salesforce API name of the loan object.
   - `EXTERNAL_LOAN_ID_FIELD`: the loan object field that holds the feed's loan ID.
   - `CRM_FIELDS`: the Salesforce field keys for status, the four property address parts, principal balance, interest rate, next payment date and maturity date.

## Ask the user

- Which Salesforce object holds loans, and which field stores the external loan ID?
- Which Salesforce fields hold the status, property address, principal balance, interest rate, next payment date and maturity date?
- What exact field names does the loan feed send? The code expects `loan_id`, `status`, `property_street`, `property_city`, `property_state`, `property_postal_code`, `principal_balance`, `interest_rate`, `next_payment_date` and `maturity_date`. Rename the keys in `InputSchema` if the feed uses others. The code does not guess them.
- Does the feed send dates as `MM/DD/YYYY` or ISO text? Both parse. Anything else becomes `null` and is not written.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, using a loan ID that exists in the user's Salesforce loan object, on a test or sandbox Salesforce connection:

```json
{
  "loan_id": "LN-100234",
  "status": "Current",
  "property_street": "12 Harbor Way",
  "property_city": "Austin",
  "property_state": "TX",
  "property_postal_code": "78701",
  "principal_balance": "$245,310.50",
  "interest_rate": "6.125",
  "next_payment_date": "11/01/2026",
  "maturity_date": "2046-10-01"
}
```

Confirm the matching loan's status, address, balance, rate and both dates changed, and that no other loan changed. Also run one payload with an unknown `loan_id` and confirm the run skips with `loan-not-found`. This was not done for this version (see Status).

## Customize

- **Create a loan when no match is found**, instead of stopping.
- **Notify owners on major status changes**: add an email or team message step after the update.

## Notes

- Nothing is created on a no-match run; loans must already exist in Salesforce.
- A payload with no status or date changes is skipped, so routine finance-only updates do not overwrite the record.
- Dates and currency are normalized in code before the write; amounts with unparseable text are written as `null`.
- Never commit a real Salesforce object name, field key or webhook URL. Anyone with the webhook URL can change loan records.
