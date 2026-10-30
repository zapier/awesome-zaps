---
name: create-customer-reference-records-in-shared-project-list
description: Build a Zapier Next Gen Zap that adds or updates a customer's reference record in a shared SharePoint list whenever a new customer is created in QuickBooks Online. Use when a sales or enablement team keeps a shared list of customer references and wants it filled in from the accounting system without manual entry.
metadata:
  author: zapier
  summary: "When a new customer is added in QuickBooks, their reference record in your shared SharePoint list is created or refreshed, so every team works from the same customer details."
  apps: "QuickBooks Online, Microsoft SharePoint"
  category: "Sales"
  job: "Sales enablement"
  source: "https://zapier.com/automations/sales/sales-enablement/customer-reference-management/create-customer-reference-records-in-shared-project-list"
---

# Create customer reference records in shared project list

## What it does

1. **Trigger:** a new customer is added in QuickBooks Online (New Customer).
2. **Microsoft SharePoint** searches the shared list for an item whose customer ID column matches the customer's `Id`.
3. If a match exists, **Microsoft SharePoint** updates that item: name, customer ID, email and phone. If not, it creates a new item with the same fields.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** QuickBooks Online, New Customer (`quickbooks`, `customer_v2`). It needs the user's QuickBooks Online connection.
2. **Connections** (each alias in the code is the app's slug):
   - `quickbooks`: the QuickBooks Online connection for the company file that creates the customers.
   - `sharepoint`: the Microsoft SharePoint connection for the account that can edit the shared list.
3. **Constants:**
   - `SITE_ID`: the SharePoint site that holds the list.
   - `LIST_ID`: the list ID of the shared customer reference list.
   - `CUSTOMER_ID_COLUMN`: the list column that stores the QuickBooks customer ID. Use the column's internal name, not its display header.
   - `EMAIL_COLUMN`: the column for the primary email address.
   - `PHONE_COLUMN`: the column for the primary phone number.
4. Test with the steps below, then publish, wait until the trigger is active, and confirm the workflow is enabled.

## Ask the user

- Which SharePoint site and list hold the shared customer references?
- What are the internal column names for the customer ID, email and phone? The name column is SharePoint's standard `Title`.
- Should updates also run when an existing QuickBooks customer changes? This template covers new customers only; see Customize.

## Test

Run this sample as a test run before publishing. Use a test customer in the user's QuickBooks Online test company, with a name that starts with "[install-test]":

```json
{
  "Id": "58",
  "DisplayName": "[install-test] Harbor Lane Bakery",
  "PrimaryEmailAddr": { "Address": "billing@example.com" },
  "PrimaryPhone": { "FreeFormNumber": "555-0100" }
}
```

Confirm that one item in the shared list has the customer ID `58`, the display name as its title, and the email and phone in their columns. Run it a second time with the same `Id`: the same item should update, not a second item appear. Then delete the test item and test customer.

## Customize

- **Notify billing or project owners** when a new reference is created: add a Slack or email step after the create step.
- **Richer context:** add the primary contact name or billing terms to the list by adding more columns and mapping them from the trigger's fields.
- **Updated customers:** add a second trigger for QuickBooks Online's Updated Customer event, so changes to existing customers refresh their reference records too.

## Notes

- The customer ID is the match key. If the list already holds two items with the same customer ID, only the first is updated.
- An empty email or phone in QuickBooks overwrites the matching column with an empty value on update.
- Never commit a real SharePoint site ID, list ID or column name to a shared copy of this file. Keep the constants as placeholders in shared copies.
