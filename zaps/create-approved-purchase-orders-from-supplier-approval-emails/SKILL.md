---
name: create-approved-purchase-orders-from-supplier-approval-emails
description: Build a Zap on Zapier that reads supplier or approver replies to purchase order alert emails, finds the matching PO in a Zapier Tables register, creates the purchase order in QuickBooks Online, and replies in the same thread. Use when a procurement or finance team approves POs by email and wants approved orders created in the accounting system without retyping them.
license: MIT
metadata:
  author: zapier
  summary: "When a supplier or approver replies to a PO alert, the matching purchase order is created in QuickBooks and the sender gets a confirmation, so approved orders never sit in an inbox."
  apps: "Microsoft Outlook, AI by Zapier, Zapier Tables, QuickBooks Online"
  category: "Finance"
  job: "Procure to pay"
  source: "https://zapier.com/automations/finance/procure-to-pay/purchase-order-management/create-approved-purchase-orders-from-supplier-approval-emails"
---

# Create approved purchase orders from supplier approval emails

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-approved-purchase-orders-from-supplier-approval-emails. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new Outlook email matching the PO alert search arrives in the inbox (`microsoft-outlook`, `new_email_search`). The search is set to the PO alert emails only, for example a subject containing "PO approval".
2. **AI by Zapier** reads the email and returns the status (approved, denied or changed), the PO number, the approver's name and, for a change, the revised material list. A denied reply, or one with no PO number, stops here.
3. **Zapier Tables** looks up the PO number in the PO register. If no row matches, the run stops and procurement gets an email.
4. **QuickBooks Online** finds the vendor named on the PO row. If there is no vendor, the run stops and procurement gets an email. Otherwise it creates an open purchase order with the PO number, the run date, the amount and the description. A changed status puts the revised materials into the description.
5. **Zapier Tables** marks the PO row as approved (or changed).
6. **Microsoft Outlook** replies in the original thread, naming the approver, the PO number and where to send receipts.

Nothing is created in QuickBooks without a matching register row and a matching vendor.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting             | What goes there                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| `PO_TABLE_ID`       | The Zapier Tables table that is the PO register. Look it up from the table the user names                      |
| `QBO_ITEM_ID`       | The QuickBooks product or service each PO line is booked against. Look it up from the item the user names      |
| `PROCUREMENT_EMAIL` | The mailbox that gets a note when no PO row or vendor matches, and that suppliers are told to send receipts to |

Also ask:

- Which Outlook search matches the PO alert emails and nothing else? Set it as the search parameter of the trigger in `triggers/new-email-search.ts`.
- Which columns of the PO register hold the PO number, vendor name, amount, description and status? Map them to `PO_NUMBER_FIELD`, `VENDOR_NAME_FIELD`, `AMOUNT_FIELD`, `DESCRIPTION_FIELD` and `STATUS_FIELD` (the defaults are `f1` to `f5`, in that order).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `microsoft-outlook` (the Outlook account whose inbox receives the replies and sends the thread reply), `zapier-tables` (the account that holds the PO register) and `quickbooks` (the QuickBooks Online account that holds vendors and purchase orders) to the user's connections. AI by Zapier, `ai`, needs no connection of its own.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-email-search.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a sample reply to a PO alert thread, from an address the connected Outlook account accepts mail from, and with a PO number that exists in the register. Use this sample email as the input:

```json
{
  "id": "AAMkAGI2THVSAAA=",
  "subject": "RE: PO approval for PO-1042",
  "body__content": "Approved. Thanks, Dana.",
  "from__emailAddress__name": "Dana Ortiz",
  "from__emailAddress__address": "dana@example.com"
}
```

Check that the register row for PO-1042 now shows its status as approved, that a purchase order numbered PO-1042 exists in QuickBooks under the right vendor with the amount from the row, and that the reply appears in the same Outlook thread. If run-status tools aren't available, check the result in QuickBooks directly. Then ask the user to delete the test data, not the agent: the test purchase order and the test row's status. Publish only after the test passes, and confirm the trigger is active.

## Notes

- A reply the AI cannot read a PO number from, or a denied reply, stops the run without writing anything or sending a reply.
- If two register rows share a PO number, only the most recently created row is used.
- To extend it: route high-value POs to a senior approver above an amount threshold, or create a task in the user's task app when the status is `changed`.
- Never commit a real table ID, email address or account ID. Replace the placeholders in `workflow.ts` and `config.ts` before deploying.
