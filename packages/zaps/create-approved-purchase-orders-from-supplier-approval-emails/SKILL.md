---
name: create-approved-purchase-orders-from-supplier-approval-emails
description: Build a Zapier Next Gen Zap that reads supplier or approver replies to purchase order alert emails, finds the matching PO in a Zapier Tables register, creates the purchase order in QuickBooks Online, and replies in the same thread. Use when a procurement or finance team approves POs by email and wants approved orders created in the accounting system without retyping them.
metadata:
  author: zapier
  summary: "When a supplier or approver replies to a PO alert, the matching purchase order is created in QuickBooks and the sender gets a confirmation, so approved orders never sit in an inbox."
  apps: "Microsoft Outlook, AI by Zapier, Zapier Tables, QuickBooks Online"
  category: "Finance"
  job: "Procure to pay"
  source: "https://zapier.com/automations/finance/procure-to-pay/purchase-order-management/create-approved-purchase-orders-from-supplier-approval-emails"
---

# Create approved purchase orders from supplier approval emails

## What it does

1. **Trigger:** a new Outlook email matching the PO alert search arrives in the inbox (for example, a subject line containing "PO approval").
2. **AI by Zapier** reads the email and returns the status (approved, denied or changed), the PO number, the approver's name and, for a change, the revised material list. A denied reply stops here.
3. **Zapier Tables** looks up the PO number in the PO register. If no row matches, the run stops and procurement gets an email.
4. **QuickBooks Online** finds the vendor named on the PO row. If there is no vendor, the run stops and procurement gets an email. Otherwise it creates an open purchase order with the PO number, the run date, the amount and the description. A changed status puts the revised materials into the description.
5. **Zapier Tables** marks the PO row as approved (or changed).
6. **Microsoft Outlook** replies in the original thread, naming the approver, the PO number and where to send receipts.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Microsoft Outlook, New Email Matching Search (`microsoft-outlook`, `new_email_search`). Set its `search` parameter to an Outlook advanced query that matches the PO alert emails only.
2. **Connections** (each alias in the code is the app's slug):
   - `microsoft-outlook`: the Outlook account whose inbox receives the replies, and that sends the thread reply.
   - `zapier-tables`: the Zapier Tables account that holds the PO register.
   - `ai`: AI by Zapier. It needs no outside account; the `authentication_id` of `"0"` uses Zapier's managed model credentials.
   - `quickbooks`: the QuickBooks Online account that holds vendors and purchase orders.
3. **Constants:**
   - `PO_TABLE_ID`: the Zapier Tables table ID of the PO register.
   - `PO_NUMBER_FIELD`, `VENDOR_NAME_FIELD`, `AMOUNT_FIELD`, `DESCRIPTION_FIELD`, `STATUS_FIELD`: column keys of that table, such as `f1`. Map the user's column headers to their keys.
   - `QBO_ITEM_ID`: the QuickBooks product or service that each purchase order line is booked against.
   - `PROCUREMENT_EMAIL`: the address that receives the no-match and no-vendor notes, and that suppliers are told to send receipts to.

## Ask the user

- Which Zapier Tables table is the PO register, and which columns hold the PO number, vendor name, amount, description and status?
- Which Outlook search matches the PO alert emails and nothing else? (The trigger's search terms.)
- Which QuickBooks product or service should each PO line use? (`QBO_ITEM_ID`.)
- Which address should procurement get notes on, and where should suppliers send receipts?

## Test

Send a sample reply to the PO alert thread, from an address that is allowed to receive mail from the connected Outlook account, and use a PO number that exists in the register. Use this sample email as the input:

```json
{
  "id": "AAMkAGI2THVSAAA=",
  "subject": "RE: PO approval for PO-1042",
  "body__content": "Approved. Thanks, Dana.",
  "from__emailAddress__name": "Dana Ortiz",
  "from__emailAddress__address": "dana@example.com"
}
```

Confirm that: the register row for PO-1042 now shows its status as approved; a purchase order with number PO-1042 exists in QuickBooks under the right vendor, with the amount from the row; and the reply appears in the same Outlook thread. Then tell the user to revert the test row and delete the test purchase order if it was real data.

## Customize

- **Route high-value POs to a senior approver:** add a check on the amount before the purchase order step, and send an approval request to the senior approver when it is above the threshold.
- **Create a procurement task when the status is changed:** add a parallel branch that creates a task in the user's task app when the status is `changed`.

## Notes

- A PO number that the AI cannot read stops the run without writing anything.
- A denied reply writes nothing and sends no reply.
- If two PO rows share a number, only the most recently created row is used.
- Never commit a real table ID, email address or account ID. Replace the placeholders in `workflow.ts` before deploying.
