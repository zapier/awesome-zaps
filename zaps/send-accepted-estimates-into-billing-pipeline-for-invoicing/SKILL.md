---
name: send-accepted-estimates-into-billing-pipeline-for-invoicing
description: Build a Zap on Zapier that sends an accepted QuickBooks Online estimate, with its line items, to your billing workflow so an invoice can be started. Use when estimates are accepted in QuickBooks Online and invoicing is done in a separate system that takes a webhook.
license: MIT
metadata:
  author: zapier
  summary: "When a customer accepts an estimate in QuickBooks, its details and line items are sent to your billing system so the invoice can be started without re-typing."
  apps: "QuickBooks Online, Webhooks by Zapier"
  category: "Sales"
  job: "Proposal management"
  source: "https://zapier.com/automations/sales/proposal-management/quote-management/send-accepted-estimates-into-billing-pipeline-for-invoicing"
---

# Send accepted estimates into billing pipeline for invoicing

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-accepted-estimates-into-billing-pipeline-for-invoicing. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** an estimate is updated in QuickBooks Online (`quickbooks`, `updated_estimate_v2`).
2. **Filter:** the run continues only when the estimate's status is the accepted status. Any other status stops the run and sends nothing.
3. **Formatting:** the line-item descriptions and quantities are joined into two delimited strings, one value per line item.
4. **Webhooks by Zapier** POSTs a form payload to your billing workflow's catch hook. The payload carries the estimate ID, document number, customer, total, PDF link, acceptance status and time, and the two delimited line-item strings.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | What goes there                                                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DOWNSTREAM_WEBHOOK_URL` | The catch-hook URL of the billing workflow or system that receives each accepted estimate. It must accept a form POST. Anyone with this URL can create billing records, so keep it private |

Also review the defaults with them: `ACCEPTED_STATUS` (`"Accepted"`, the QuickBooks Online status that means accepted; change it if their company reads it differently) and `LINE_DELIMITER` (`"; "`, the separator between line items).

Confirm two things before turning it on:

- The `quickbooks` account is the QuickBooks Online company that holds the estimates.
- The downstream system can handle repeats. Every accepted update sends a new POST, so it must de-duplicate on `reference` if it should not create a second record.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `quickbooks` (the user's QuickBooks Online connection for the company that holds the estimates) to the user's connection. The trigger uses it, and the workflow itself has no connection. Webhooks by Zapier needs none.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-estimate.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections, and sample the trigger, before the first test run. Fix any key in `workflow.ts` that doesn't match.

## Test it

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

If run-status tools aren't available, check the result in the catch hook you control directly. The user deletes any test data; the agent does not.

## Notes

- Each accepted update produces a POST. If the same estimate is edited again after acceptance, the downstream system receives it again.
- Line items are sent as text, so the receiving system must split them on `LINE_DELIMITER` to read them back.
- The estimate PDF comes from QuickBooks as a file; the workflow sends its link as `document_url`. Confirm the link is reachable from the billing system, or have it fetch and store the PDF for archival.
- To create an invoice draft back in QuickBooks Online, add a step after the POST that is gated on the downstream system's acknowledgement.
- Never commit a real webhook URL. Anyone with the URL can create billing records.
