---
name: add-opportunities-from-membership-invoices-to-sales-team
description: Build a Zapier Next Gen Zap that finds or creates a Salesforce opportunity for each paid membership invoice in Stripe, links it to the customer's contact and records the invoice amount, date and plan. Use when a business sells memberships through Stripe, keeps its pipeline in Salesforce, and wants membership revenue to show up there without manual entry.
metadata:
  author: zapier
  summary: "When a membership invoice is paid in Stripe, a matching opportunity appears in Salesforce with the amount, close date and plan, linked to the customer, so the sales team sees the revenue."
  apps: "Stripe, Salesforce"
  category: "Sales"
  job: "Pipeline management"
  source: "https://zapier.com/automations/sales/pipeline-management/deal-tracking/add-opportunities-from-membership-invoices-to-sales-team"
---

# Add opportunities from membership invoices to sales team

## What it does

1. **Trigger:** a paid invoice appears in Stripe (New Invoice, filtered to status `paid`).
2. **Filter:** the invoice's plan must be one of the membership plans named in the code. Any other invoice stops the run.
3. **Wait:** the run pauses five minutes so upstream systems finish processing the invoice before the CRM lookups.
4. **Salesforce** finds the contact whose Stripe customer ID matches the invoice's customer. If there is none, it creates one.
5. **Salesforce** searches for an opportunity already holding this invoice ID. If there is one, the run stops. If not, it creates a membership opportunity with the invoice amount, the invoice date as close date, the plan in the membership plan field, and the revenue recognition stage. It then makes the contact the opportunity's primary contact.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run. Salesforce field names are the user's own custom fields, so check them against their org.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Stripe, New Invoice (`stripe`, `new_invoice_v2`), with `status` set to `paid`. It needs the user's Stripe connection, so its `authentication_id` is that connection's ID.
2. **Connections** (each alias in the code is the app's slug):
   - `salesforce`: the user's Salesforce connection, for the org that holds the pipeline.
3. **Constants** (at the top of `workflow.ts`):
   - `QUALIFYING_PLAN_NAMES`: the Stripe price or plan nicknames that count as membership invoices.
   - `MEMBERSHIP_RECORD_TYPE_ID`: the Salesforce record type ID for membership opportunities.
   - `CONTACT_STRIPE_CUSTOMER_FIELD`: the API name of the Contact field that stores the Stripe customer ID.
   - `OPPORTUNITY_INVOICE_ID_FIELD`: the API name of the Opportunity field that stores the Stripe invoice ID.
   - `OPPORTUNITY_PLAN_FIELD`: the API name of the Opportunity membership plan picklist.
   - `REVENUE_RECOGNITION_STAGE`: the opportunity stage for paid invoices.
   - `UPSTREAM_WAIT_SECONDS`: how long to wait before the CRM lookups. Defaults to `300`.

## Ask the user

- Which Stripe price or plan names are membership plans? Invoices for any other plan are skipped.
- Which Salesforce record type holds membership opportunities, and which stage counts as revenue recognition?
- Which Salesforce custom fields hold the Stripe customer ID (on Contact), the Stripe invoice ID (on Opportunity) and the membership plan (on Opportunity)? Use the API names, such as `Stripe_Customer_ID__c`.
- Should a Stripe invoice with no matching contact create one, as this zap does, or be skipped?

## Test

Run this sample as a test run with a membership plan name that is in `QUALIFYING_PLAN_NAMES`, against a Salesforce sandbox or integration account, with records named `[install-test] …`:

```json
{
  "id": "in_test_0001",
  "object": "invoice",
  "status": "paid",
  "customer": "cus_test_0001",
  "customer_name": "[install-test] Sample Member",
  "customer_email": "you@example.com",
  "amount_paid": 4900,
  "currency": "usd",
  "created": 1767225600,
  "lines": {
    "data": [{ "price": { "nickname": "Membership" } }]
  }
}
```

Check that one opportunity appeared in Salesforce with the amount `49`, the close date `2026-01-01`, the plan in the plan field, and the revenue recognition stage. Check that the contact is its primary contact. Then run the same sample again and check that no second opportunity appears. Delete the test records afterwards.

Also run a sample whose plan is not in `QUALIFYING_PLAN_NAMES`, and check that the run stops and writes nothing.

## Customize

- **Draft instead of closed stage:** set `REVENUE_RECOGNITION_STAGE` to a draft or pipeline stage so a person reviews the opportunity first.
- **Revenue ops alert on discounts:** add a Slack or email step after the opportunity is created, when the invoice carries a coupon or discount.

## Notes

- Stripe amounts are in the smallest currency unit. The code divides by 100, which is right for dollar-style currencies but not for zero-decimal ones such as JPY.
- If the contact lookup finds nothing and the contact cannot be created, the run fails at that step, and the failure shows in the run history.
- If two contacts share a Stripe customer ID, only the first is used.
- Never commit real Salesforce IDs, field names or Stripe customer data to a public template.
