---
name: create-employer-profile-and-push-to-onboarding-system
description: Build a Zapier Next Gen Zap that, when a new Salesforce Account is created, writes an onboarding record to a Zapier Table with the owner's email and normalized industry and sector fields, posts it to your onboarding/payroll API, and writes the external ID and sync status back to both the table and Salesforce. Use when a CRM is the source of new clients or employers and an HR or onboarding system needs the profile without anyone re-keying it.
metadata:
  author: zapier
  summary: "When a new account is created in your CRM, its onboarding profile is created in your table, sent to your onboarding system, and the sync result is written back to both places."
  apps: "Salesforce, Zapier Tables, Webhooks by Zapier"
  category: "Human Resources (HR)"
  job: "Talent pipeline management"
  source: "https://zapier.com/automations/human-resources-hr/talent-pipeline-management/employee-onboarding/create-employer-profile-and-push-to-onboarding-system"
---

# Create employer profile and push to onboarding system

## What it does

1. **Trigger:** a new Salesforce record of the Account object is created.
2. **Salesforce** looks up the account owner (a User record) by the account's `OwnerId` and takes the owner's email.
3. **Code** (plain JavaScript, no app call): turns the semicolon-separated Industry and Sector lists into readable text, normalizes the employee count into a number, and joins the billing address into one line.
4. **Zapier Tables** creates a record in your onboarding table: company name as the title, owner email, website, phone, address, industries, sectors, notes, the Salesforce account ID as the reference, and status `In Progress`.
5. **Webhooks by Zapier** POSTs the profile as JSON to your onboarding/payroll API, with a bearer token.
6. **Zapier Tables** updates that record with the API's external ID and a sync status (`Synced` or `Failed`).
7. **Salesforce** writes the same external ID and sync status to the account.

If the onboarding API URL is not set, the run stops before step 2 and writes nothing.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Salesforce, New Record (`salesforce`, action `new_record`), with `object` set to `Account`. It needs a Salesforce connection (`authentication_id` is that connection's ID, not `null`).
2. **Connections** (each alias in the code is the app's slug):
   - `salesforce`: the Salesforce connection for the org that owns the accounts.
   - `zapier-tables`: the Zapier Tables connection for the account that owns the onboarding table.
   - Webhooks by Zapier needs no connection.
3. **Constants:**
   - `ONBOARDING_TABLE_ID`: the ID of your onboarding table.
   - `ONBOARDING_API_URL`: your onboarding/payroll API endpoint (must start with `https://`).
   - `ONBOARDING_API_TOKEN`: the API's bearer token. Store it as a secret in your own setup; do not commit it.
   - `SALESFORCE_OBJECT`: `Account` by default.
   - `SALESFORCE_SECTOR_FIELD`: the Salesforce field that holds sectors. `Sector__c` is a guess.
   - `SALESFORCE_EXTERNAL_ID_FIELD`, `SALESFORCE_SYNC_STATUS_FIELD`: the Salesforce fields that receive the external ID and sync status.
   - `INITIAL_STATUS`: the status written before the API responds. Defaults to `In Progress`.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the trigger's webhook details if they have any.

## Ask the user

- Which Salesforce org and connection hold the accounts? Which Zapier Tables table is the onboarding table, and what are its field names?
- What is the onboarding/payroll API's endpoint and how does it authenticate? If it is not a bearer token, change the `post-to-onboarding-api` headers.
- Which Salesforce custom fields hold the sector, external ID and sync status?
- Does the API return the new record's ID as `id`? If not, change `externalId` in the code.

## Test

Run this sample as a draft test run (`run_workflow_draft`) before publishing, against a Salesforce sandbox or integration org and a test table, with an Account that exists in that org:

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

Check that: the table gains one record with title `Example Test Co`, owner email filled, `Industries` as `Technology, Software`, `Sectors` as `Fintech, Payments`, and status `In Progress`; the API receives one JSON POST with `employeeCount` 1200; the record's status then changes to `Synced` and its external ID is filled; the Salesforce account's sync fields are written. Then delete the test rows.

## Customize

- **Filter** to continue only for qualifying accounts, for example by client type: add a check before the owner lookup.
- **Notify your team** on high-priority hires: add a Slack message step after the Salesforce update.

## Notes

- Nothing is sent until `ONBOARDING_API_URL` is a real `https://` URL. The workflow returns `skipped` before touching any app until then.
- The Zapier Tables field names (`Title`, `Owner email`, `Industries`, and so on) are the names this template expects. Match them to your table's field names before testing.
- The payload's Salesforce field names (`Id`, `OwnerId`, `Industry`, and so on) were taken from the standard Account object and have not been sampled from a real trigger.
- Keep the onboarding API token out of shared copies of this workflow.
