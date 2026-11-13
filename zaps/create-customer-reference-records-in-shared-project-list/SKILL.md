---
name: create-customer-reference-records-in-shared-project-list
description: Build a Zap on Zapier that adds or updates a customer's reference record in a shared SharePoint list whenever a new customer is created in QuickBooks Online. Use when a sales or enablement team keeps a shared list of customer references and wants it filled in from the accounting system without manual entry.
license: MIT
metadata:
  author: zapier
  summary: "When a new customer is added in QuickBooks, their reference record in your shared SharePoint list is created or refreshed, so every team works from the same customer details."
  apps: "QuickBooks Online, Microsoft SharePoint"
  category: "Sales"
  job: "Sales enablement"
  source: "https://zapier.com/automations/sales/sales-enablement/customer-reference-management/create-customer-reference-records-in-shared-project-list"
---

# Create customer reference records in shared project list

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-customer-reference-records-in-shared-project-list. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new customer is added in `quickbooks` (`customer_v2`, New Customer).
2. **`sharepoint`** searches the shared list for an item whose customer ID column matches the customer's `Id`.
3. If a match exists, **`sharepoint`** updates that item: name, customer ID, email and phone. If not, it creates a new item with the same fields.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting              | What goes there                                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `SITE_ID`            | The SharePoint site that holds the shared customer reference list: ask which site, then look up its ID                            |
| `LIST_ID`            | The shared customer reference list on that site: ask which list, then look up its ID                                              |
| `CUSTOMER_ID_COLUMN` | The list column that stores the QuickBooks customer ID: look up its internal name from the list's columns, not its display header |
| `EMAIL_COLUMN`       | The list column for the customer's primary email address: look up from the list's columns                                         |
| `PHONE_COLUMN`       | The list column for the customer's primary phone number: look up from the list's columns                                          |

The name column is SharePoint's standard `Title`, so it needs no setting.

Ask whether updates should also run when an existing QuickBooks customer changes. This template covers new customers only; see Notes.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `sharepoint` (used by the workflow) to the user's Microsoft SharePoint connection for the account that can edit the shared list, and `quickbooks` (used by the trigger) to their QuickBooks Online connection for the company file that creates the customers.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/customer.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a test run before publishing. Use a test customer in the user's QuickBooks Online test company, with a name that starts with "[install-test]":

```json
{
  "Id": "58",
  "DisplayName": "[install-test] Harbor Lane Bakery",
  "PrimaryEmailAddr": { "Address": "billing@example.com" },
  "PrimaryPhone": { "FreeFormNumber": "555-0100" }
}
```

Check that one item in the shared list has the customer ID `58`, the display name as its title, and the email and phone in their columns. Run it a second time with the same `Id`: the same item should update, not a second item appear. If run-status tools aren't available, check the result in Microsoft SharePoint directly. Ask the user to delete the test item and test customer. Then publish, confirm the trigger is active, and confirm the workflow is enabled.

## Notes

- The customer ID is the match key. If the list already holds two items with the same customer ID, only the first is updated.
- An empty email or phone in QuickBooks overwrites the matching column with an empty value on update.
- To notify billing or project owners when a new reference is created, add a Slack or email step after the create step.
- To add richer context, add the primary contact name or billing terms as list columns and map them from the trigger's fields.
- To refresh references when existing customers change too, add a second trigger for QuickBooks Online's Updated Customer event.
- Real SharePoint IDs and column names belong only in the user's own copy, never in this shared one.
