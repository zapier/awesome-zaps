---
name: create-staff-bonus-records-when-appointments-are-added
description: Build a Zapier Next Gen Zap that logs a Staff Account Transaction in Salesforce with a tiered bonus whenever a qualifying Appointment record is created, finding (or creating) the staff record it belongs to. Use when a clinic, salon or service business tracks appointments in Salesforce and pays staff a per-appointment bonus through payroll.
metadata:
  author: zapier
  summary: "When a new appointment is added in Salesforce, a bonus transaction for the staff member is logged automatically, so payroll is ready to process."
  apps: "Salesforce"
  category: "Human Resources (HR)"
  job: "Payroll compensation"
  source: "https://zapier.com/automations/human-resources-hr/payroll-compensation/payroll-processing/create-staff-bonus-records-when-appointments-are-added"
---

# Create staff bonus records when appointments are added

## What it does

1. **Trigger:** a new record of the Appointment object is created in Salesforce.
2. **Bonus tier** (code, no step): the appointment's type picks the bonus. Types in `LARGE_TIER_TYPES` get `LARGE_TIER_AMOUNT` ($5.00), types in `SMALL_TIER_TYPES` get `SMALL_TIER_AMOUNT` ($2.50). Any other type stops the run and writes nothing.
3. **Salesforce** finds the staff record whose `STAFF_MATCH_FIELD` equals the appointment's staff reference (`APPOINTMENT_STAFF_REF_FIELD`, falling back to the appointment's `OwnerId`). If none is found, it creates one.
4. **Salesforce** creates a Staff Account Transaction: created date from the appointment's `CreatedDate`, the staff lookup, the bonus amount, the appointment's `Name` as the memo, and the classification labels `TX_CLASSIFICATION_VALUE` / `TX_DETAIL_VALUE`.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Salesforce, New Record (`salesforce`, `new_record`), with `params.object` set to the Appointment object's API name (the draft used `Appointment__c`). Its `authentication_id` is the user's Salesforce connection ID.
2. **Connections** (each alias in the code is the app's slug):
   - `salesforce`: the user's Salesforce connection, for the org that holds appointments, staff and transactions. Use a sandbox org for the first test.
3. **Constants** (all are Salesforce API names unless noted; check them with the action's field choices, `inspect_zapier_actions` with `object` set):
   - `APPOINTMENT_STAFF_REF_FIELD`: the appointment field naming the staff member. If it's empty the code uses `OwnerId`.
   - `APPOINTMENT_TYPE_FIELD`: the appointment field holding its type.
   - `SMALL_TIER_TYPES`, `LARGE_TIER_TYPES`: type values (exact picklist values) for each tier.
   - `SMALL_TIER_AMOUNT`, `LARGE_TIER_AMOUNT`: bonus amounts. Default 2.50 and 5.00.
   - `STAFF_OBJECT`, `STAFF_MATCH_FIELD`: the staff object and the field matched against the staff reference. A new staff record gets `Name` and that field set to the reference; add any fields the org requires.
   - `TRANSACTION_OBJECT` and the `TX_*_FIELD` constants: the Staff Account Transaction object and its created-date, staff-lookup, currency, memo, classification and detail fields.
   - `TX_CLASSIFICATION_VALUE`, `TX_DETAIL_VALUE`: the labels written on every transaction. Defaults `"Credit"` and `"Appointment Bonus"`.
4. Sample the trigger (`new_record` read with the same `object`) and check the record really carries `Id`, `Name`, `CreatedDate`, `OwnerId` and the two appointment fields above. Then test, publish, and wait until the trigger is active.

## Ask the user

- Which Salesforce object holds appointments, and which fields hold the staff reference and the appointment type?
- Which appointment types earn the smaller bonus, which the larger, and are $2.50 and $5.00 right?
- Which object holds staff, and which of its fields matches the appointment's staff reference? What else must a new staff record have?
- Which object and fields make up a Staff Account Transaction, and which classification labels should it carry?
- Is there a sandbox org to test in? Don't test against a production org.

## Test

Run this as a draft test run (`run_workflow_draft` in Zapier MCP) against a sandbox org, with field names changed to match the constants:

```json
{
  "Id": "a0X000000000001AAA",
  "Name": "[install-test] Premium appointment",
  "CreatedDate": "2026-10-29T10:00:00.000+0000",
  "OwnerId": "005000000000001AAA",
  "Type__c": "Premium",
  "Staff_Reference__c": "[install-test] STAFF-001"
}
```

Check in Salesforce that:

- a staff record with reference `[install-test] STAFF-001` exists (created on the first run, reused on a second run with the same reference);
- one new Staff Account Transaction links to it, with amount 5.00, memo `[install-test] Premium appointment`, the created date above and the two classification labels.

Then run it with `"Type__c": "Other"` and confirm it returns `appointment-type-not-eligible` and writes nothing. Delete the test records afterwards.

## Customize

- **Notify payroll:** add a step that posts each new transaction to the payroll channel (Slack, Teams or email).
- **Different bonus rules:** replace the fixed tiers with a percentage of the appointment value, or a promotion-based amount.

## Notes

- The spec's Paths step is a plain `if/else` in code, and the trigger mapping is just reading fields from the record, so the workflow has only two or three Salesforce steps.
- The staff search uses a SOQL `WHERE` clause; the reference is quoted and escaped. If more than one staff record matches, the first one is used.
- The created date is copied from the appointment as Salesforce sends it. If the transaction's date field is a Date (not Date/Time), Salesforce may reject the full timestamp; trim it to `YYYY-MM-DD` or switch the action to `create_record_utc`.
- Salesforce is a CRM with real records: never test against a production org, and name test records `[install-test] …`.
