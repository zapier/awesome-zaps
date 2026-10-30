---
name: send-accepted-estimates-into-billing-pipeline-for-invoicing
description: Build a Zapier Next Gen Zap that sends an accepted QuickBooks Online estimate, with its line items, to your billing workflow so an invoice can be started. Use when estimates are accepted in QuickBooks Online and invoicing is done in a separate system that takes a webhook.
metadata:
  author: zapier
  summary: "When a customer accepts an estimate in QuickBooks, its details and line items are sent to your billing system so the invoice can be started without re-typing."
  apps: "QuickBooks Online, Webhooks by Zapier"
  category: "Sales"
  job: "Proposal management"
  source: "https://zapier.com/automations/sales/proposal-management/quote-management/send-accepted-estimates-into-billing-pipeline-for-invoicing"
---

# Send accepted estimates into billing pipeline for invoicing

## What it does

1. **Trigger:** an estimate is updated in QuickBooks Online (QuickBooks Online, Updated Estimate).
2. **Filter:** the run continues only when the estimate's status is the accepted status. Any other status stops the run and sends nothing.
3. **Formatting:** the line-item descriptions and quantities are joined into two delimited strings, one value per line item.
4. **Webhooks by Zapier** POSTs a form payload to your billing workflow's catch hook. The payload carries the estimate ID, document number, customer, total, PDF link, acceptance status and time, and the two delimited line-item strings.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**Check the fields first:** with the user's own connections, inspect the trigger and the Webhooks by Zapier POST action (`inspect_zapier_actions`, `get_trigger_fields`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** QuickBooks Online, Updated Estimate (`quickbooks`, action `updated_estimate_v2`). Bind your QuickBooks Online connection to it.
2. **Connections:**
   - `quickbooks`: the user's QuickBooks Online connection, for the company file that holds the estimates. Used by the trigger only.
   - Webhooks by Zapier has no connection. The POST action runs without one.
3. **Constants:**
   - `DOWNSTREAM_WEBHOOK_URL`: the catch-hook URL of your billing workflow or system. Anyone with this URL can create billing records, so keep it private.
   - `ACCEPTED_STATUS`: the QuickBooks Online status that means accepted. Defaults to `"Accepted"`.
   - `LINE_DELIMITER`: the separator placed between line items in the description and quantity strings. Defaults to `"; "`.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the trigger details they need.

## Ask the user

- Which QuickBooks Online company should the trigger watch?
- What is the billing system's webhook URL? Is it a catch hook that accepts a form POST?
- Does the QuickBooks Online status for accepted estimates read as `Accepted` in their company, or do they use a different status?
- Should the downstream system create a new record for every update to an accepted estimate, or match on the estimate ID? The workflow always sends a new POST, so the receiving side must de-duplicate on `reference` if needed.

## Test

Run this sample as a draft test run before publishing. Point `DOWNSTREAM_WEBHOOK_URL` at a catch hook you control, not at the live billing system:

```json
{
  "Id": "1042",
  "TxnStatus": "Accepted",
  "DocNumber": "EST-1042",
  "TotalAmt": 1250.5,
  "CustomerRef__value": "58",
  "CustomerRef__name": "Example Customer",
  "pdf": "https://example.com/estimate-1042.pdf",
  "MetaData__LastUpdatedTime": "2026-10-29T10:15:00Z",
  "Line[]Description": ["Consulting", "Setup"],
  "Line[]SalesItemLineDetail__Qty": [10, 2]
}
```

Check that the catch hook receives one form POST with `reference` set to `1042`, `acceptance_status` set to `Accepted`, `line_descriptions` set to `Consulting; Setup`, and `line_quantities` set to `10; 2`. Then send the same sample with `TxnStatus` set to `Pending`, and check that nothing is posted.

## Customize

- **Attach the estimate PDF** to the downstream record for archival: the payload already carries the PDF link in `document_url`; have the receiving system fetch and store it.
- **Create an invoice draft** back in the accounting system once the downstream system acknowledges the payload: add a QuickBooks Online step after the POST that creates an invoice draft, gated on the acknowledgement.

## Notes

- Each accepted update produces a POST. If the same estimate is edited again after acceptance, the downstream system receives it again.
- Line items are sent as text, so the receiving system must split them on `LINE_DELIMITER` to read them back.
- The estimate PDF comes from QuickBooks as a file; the workflow sends its link. Confirm the link is reachable from the billing system.
- Never commit a real webhook URL. Anyone with the URL can create billing records.
