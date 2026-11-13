---
name: create-employer-profile-and-push-to-onboarding-system
description: Build a Zap on Zapier that, when a new Salesforce Account is created, writes an onboarding record to a Zapier Table with the owner's email and normalized industry and sector fields, posts it to your onboarding/payroll API, and writes the external ID and sync status back to both the table and Salesforce. Use when a CRM is the source of new clients or employers and an HR or onboarding system needs the profile without anyone re-keying it.
license: MIT
metadata:
  author: zapier
  summary: "When a new account is created in your CRM, its onboarding profile is created in your table, sent to your onboarding system, and the sync result is written back to both places."
  apps: "Salesforce, Zapier Tables, Webhooks by Zapier"
  category: "Human Resources (HR)"
  job: "Talent pipeline management"
  source: "https://zapier.com/automations/human-resources-hr/talent-pipeline-management/employee-onboarding/create-employer-profile-and-push-to-onboarding-system"
---

# Create employer profile and push to onboarding system

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-employer-profile-and-push-to-onboarding-system. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new Salesforce record of the Account object is created (`salesforce`, `new_record`).
2. **Salesforce** looks up the account owner (a User record) by the account's `OwnerId` and takes the owner's email.
3. **Code** (plain JavaScript, no app call): turns the semicolon-separated Industry and Sector lists into readable text, normalizes the employee count into a number, and joins the billing address into one line.
4. **Zapier Tables** creates a record in your onboarding table: company name as the title, owner email, website, phone, address, industries, sectors, notes, the Salesforce account ID as the reference, and status `In Progress`.
5. **Webhooks by Zapier** POSTs the profile as JSON to your onboarding/payroll API, with a bearer token.
6. **Zapier Tables** updates that record with the API's external ID and a sync status (`Synced` or `Failed`).
7. **Salesforce** writes the same external ID and sync status to the account.

If the onboarding API URL is not set, the run stops before step 2 and writes nothing.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                        | What goes there                                                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `ONBOARDING_TABLE_ID`          | The Zapier Table that holds onboarding records; look it up with the user's Zapier Tables connection                   |
| `ONBOARDING_API_URL`           | The onboarding/payroll API endpoint that receives each profile. It must be an `https://` URL                          |
| `ONBOARDING_API_TOKEN`         | The API's bearer token. A secret: store it in your own setup and never commit it                                      |
| `SALESFORCE_EXTERNAL_ID_FIELD` | The custom Account field that receives the onboarding system's external ID; look it up with the Salesforce connection |
| `SALESFORCE_SYNC_STATUS_FIELD` | The custom Account field that receives the sync status; look it up with the Salesforce connection                     |

Review these defaults with them: `SALESFORCE_OBJECT` (`Account`), `SALESFORCE_SECTOR_FIELD` (`Sector__c` is a guess, so confirm the org's sector field), and `INITIAL_STATUS` (`In Progress`).

Also confirm:

- The onboarding API authenticates with a bearer token. If not, change the headers in the `post-to-onboarding-api` step.
- The API returns the new record's ID as `id`. If not, change `externalId` in the code.
- The onboarding table's field names match the ones `workflow.ts` writes (`Title`, `Owner email`, `Industries`, and so on).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `salesforce` (the org that owns the accounts) and `zapier-tables` (the account that owns the onboarding table) to the user's connections. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-record.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test against a Salesforce sandbox or integration org and a test table, with an Account that exists in that org:

```json
{
  "Id": "001XXXXXXXXXXXXXXX",
  "Name": "Example Test Co",
  "OwnerId": "005XXXXXXXXXXXXXXX",
  "Website": "https://example.com",
  "Phone": "+1 555 0100",
  "Industry": "Technology;Software",
  "Sector__c": "Fintech;Payments",
  "NumberOfEmployees": "1,200",
  "Description": "Test account",
  "BillingStreet": "1 Test Way",
  "BillingCity": "Sample City",
  "BillingState": "CA",
  "BillingPostalCode": "94000",
  "BillingCountry": "US"
}
```

Check that the table gains one record with title `Example Test Co`, owner email filled, `Industries` as `Technology, Software`, `Sectors` as `Fintech, Payments`, and status `In Progress`. The API should receive one JSON POST with `employeeCount` 1200. The record's status should then change to `Synced` with its external ID filled, and the Salesforce account's sync fields should be written. If run-status tools aren't available, check the result in Zapier Tables and Salesforce directly. Ask the user to delete the test rows; the agent doesn't delete them.

Then publish, and confirm the trigger is active.

## Notes

- Nothing is sent until `ONBOARDING_API_URL` is a real `https://` URL. Until then the workflow returns `skipped` before touching any app.
- The Salesforce field names in the payload (`Id`, `OwnerId`, `Industry`, and so on) come from the standard Account object. Sample the trigger to confirm them before testing.
- Keep the onboarding API token out of shared copies of this workflow.
- To continue only for qualifying accounts, for example by client type, add a check before the owner lookup. To alert your team on high-priority hires, add a Slack message step after the Salesforce update.
