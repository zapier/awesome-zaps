---
name: add-opportunities-from-membership-invoices-to-sales-team
description: Build a Zap on Zapier that finds or creates a Salesforce opportunity for each paid membership invoice in Stripe, links it to the customer's contact and records the invoice amount, date and plan. Use when a business sells memberships through Stripe, keeps its pipeline in Salesforce, and wants membership revenue to show up there without manual entry.
license: MIT
metadata:
  author: zapier
  summary: "When a membership invoice is paid in Stripe, a matching opportunity appears in Salesforce with the amount, close date and plan, linked to the customer, so the sales team sees the revenue."
  apps: "Stripe, Salesforce"
  category: "Sales"
  job: "Pipeline management"
  source: "https://zapier.com/automations/sales/pipeline-management/deal-tracking/add-opportunities-from-membership-invoices-to-sales-team"
---

# Add opportunities from membership invoices to sales team

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/add-opportunities-from-membership-invoices-to-sales-team. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a paid invoice appears in Stripe (`stripe`, `new_invoice_v2`, filtered to status `paid`).
2. **Filter:** the invoice's plan must be one of the membership plans named in the code. Any other invoice stops the run.
3. **Wait:** the run pauses five minutes so upstream systems finish processing the invoice before the CRM lookups.
4. **Salesforce** finds the contact whose Stripe customer ID matches the invoice's customer. If there is none, it creates one.
5. **Salesforce** searches for an opportunity already holding this invoice ID. If there is one, the run stops. If not, it creates a membership opportunity with the invoice amount, the invoice date as close date, the plan in the membership plan field, and the revenue recognition stage. It then makes the contact the opportunity's primary contact.

An invoice that already has an opportunity is skipped, so a rerun never makes a second one.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                                 | What goes there                                                                                                                           |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_MEMBERSHIP_PLAN_NAME`          | The Stripe price or plan nicknames that count as membership invoices, in `QUALIFYING_PLAN_NAMES` (`workflow.ts`). Other plans are skipped |
| `REPLACE_MEMBERSHIP_RECORD_TYPE_ID`     | The Salesforce record type for membership opportunities                                                                                   |
| `REPLACE_REVENUE_RECOGNITION_STAGE`     | The opportunity stage that counts as revenue recognition, set on new opportunities for paid invoices                                      |
| `REPLACE_CONTACT_STRIPE_CUSTOMER_FIELD` | The API name of the Contact field that holds the Stripe customer ID                                                                       |
| `REPLACE_OPPORTUNITY_INVOICE_ID_FIELD`  | The API name of the Opportunity field that holds the Stripe invoice ID (the external ID)                                                  |
| `REPLACE_OPPORTUNITY_PLAN_FIELD`        | The API name of the Opportunity membership plan picklist                                                                                  |

Salesforce field names are the user's own custom fields, such as `Stripe_Customer_ID__c`.

Defaults to review with them: `UPSTREAM_WAIT_SECONDS` (`300`, the wait before the CRM lookups, in `workflow.ts`), and whether an invoice with no matching contact should create one, as this zap does, or be skipped.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `salesforce` (the org that holds the pipeline) to the user's Salesforce connection, and `stripe` (the trigger's account) to the user's Stripe connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-invoice.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's `status` to `paid`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match. Check the custom field API names against their Salesforce org.

## Test it

Run this sample as a test run against a Salesforce sandbox or integration account, with the plan nickname set to a name in `QUALIFYING_PLAN_NAMES`:

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

Check that one opportunity appeared in Salesforce with the amount `49`, the close date `2026-01-01`, the plan in the plan field, and the revenue recognition stage. Check that the contact is its primary contact. Then run the same sample again and check that no second opportunity appears. Also run a sample whose plan is not in `QUALIFYING_PLAN_NAMES`, and check that the run stops and writes nothing.

If run-status tools aren't available, check the result in Salesforce directly. Ask the user to delete the test records; the agent doesn't delete them. Then publish, confirm the trigger is active, and ask the user before the first live invoice flows through.

## Notes

- Stripe amounts are in the smallest currency unit. The code divides by 100, which is right for dollar-style currencies but not for zero-decimal ones such as JPY.
- If the contact lookup finds nothing and the contact cannot be created, the run fails at that step, and the failure shows in the run history.
- If two contacts share a Stripe customer ID, only the first is used.
- To review first, set `REPLACE_REVENUE_RECOGNITION_STAGE` to a draft or pipeline stage. To alert on discounts, add a Slack or email step after the opportunity is created, for invoices that carry a coupon.
- Never commit real Salesforce IDs, field names or Stripe customer data to a public template.
