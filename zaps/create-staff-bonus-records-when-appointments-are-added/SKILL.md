---
name: create-staff-bonus-records-when-appointments-are-added
description: Build a Zap on Zapier that logs a Staff Account Transaction in Salesforce with a tiered bonus whenever a qualifying Appointment record is created, finding (or creating) the staff record it belongs to. Use when a clinic, salon or service business tracks appointments in Salesforce and pays staff a per-appointment bonus through payroll.
license: MIT
metadata:
  author: zapier
  summary: "When a new appointment is added in Salesforce, a bonus transaction for the staff member is logged automatically, so payroll is ready to process."
  apps: "Salesforce"
  category: "Human Resources (HR)"
  job: "Payroll compensation"
  source: "https://zapier.com/automations/human-resources-hr/payroll-compensation/payroll-processing/create-staff-bonus-records-when-appointments-are-added"
---

# Create staff bonus records when appointments are added

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-staff-bonus-records-when-appointments-are-added. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new Appointment record is created in Salesforce (`salesforce`, `new_record`).
2. **Bonus tier** (code, no step): the appointment's type picks the bonus. Types in `LARGE_TIER_TYPES` get $5.00, types in `SMALL_TIER_TYPES` get $2.50. Any other type stops the run and writes nothing.
3. **Salesforce** finds the staff record whose staff match field equals the appointment's staff reference, falling back to the appointment's `OwnerId`. If none is found, it creates one.
4. **Salesforce** creates a Staff Account Transaction: created date from the appointment, the staff lookup, the bonus amount, the appointment's name as the memo, and the classification labels.

The Zap only creates records. It never changes an existing staff record or transaction.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to API names with the user's Salesforce connection; don't ask them to paste a field name you can look up.

| Setting                               | Where                                     | What goes there                                                        |
| ------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------- |
| `REPLACE_APPOINTMENT_OBJECT`          | `triggers/new-record.ts`, `params.object` | The object that holds appointments                                     |
| `REPLACE_APPOINTMENT_STAFF_REF_FIELD` | `config.ts`                               | The appointment field naming the staff member; falls back to `OwnerId` |
| `REPLACE_APPOINTMENT_TYPE_FIELD`      | `config.ts`                               | The appointment field holding the type that picks the bonus tier       |
| `REPLACE_STAFF_OBJECT`                | `config.ts`                               | The object that holds staff                                            |
| `REPLACE_STAFF_MATCH_FIELD`           | `config.ts`                               | The staff field matched against the appointment's staff reference      |
| `REPLACE_TRANSACTION_OBJECT`          | `config.ts`                               | The Staff Account Transaction object                                   |
| `REPLACE_TX_CREATED_DATE_FIELD`       | `config.ts`                               | The transaction field holding the created date                         |
| `REPLACE_TX_STAFF_LOOKUP_FIELD`       | `config.ts`                               | The transaction field linking to the staff record                      |
| `REPLACE_TX_AMOUNT_FIELD`             | `config.ts`                               | The transaction field holding the bonus amount                         |
| `REPLACE_TX_MEMO_FIELD`               | `config.ts`                               | The transaction field holding the memo                                 |
| `REPLACE_TX_CLASSIFICATION_FIELD`     | `config.ts`                               | The transaction field holding the classification label                 |
| `REPLACE_TX_DETAIL_FIELD`             | `config.ts`                               | The transaction field holding the detail label                         |

Also review these defaults with them:

- `SMALL_TIER_TYPES` and `LARGE_TIER_TYPES` in `workflow.ts`: which appointment types earn each tier, as exact picklist values. Defaults `Standard` and `Premium`.
- `SMALL_TIER_AMOUNT` and `LARGE_TIER_AMOUNT` in `workflow.ts`: the bonus amounts, in the org's currency. Defaults 2.50 and 5.00.
- `TX_CLASSIFICATION_VALUE` and `TX_DETAIL_VALUE` in `config.ts`: the labels written on every transaction. Defaults `"Credit"` and `"Appointment Bonus"`.

Also ask:

- Does a new staff record need any other required fields? If so, the create step in `workflow.ts` must set them.
- Is there a sandbox org to test in? Don't test against a production org.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `salesforce` to the user's Salesforce connection for the org that holds appointments, staff and transactions.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-record.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connection, and sample the trigger (`new_record` read with the same object) before the first test run. Check that the record carries `Id`, `Name`, `CreatedDate`, `OwnerId` and the appointment type and staff fields, then fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test (`run_workflow_draft`) against a sandbox org, with field names changed to match the settings:

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

Then run it with `"Type__c": "Other"` and confirm it returns `appointment-type-not-eligible` and writes nothing. If run-status tools aren't available, check the result in Salesforce directly. Ask the user to delete the test records; the agent doesn't delete them.

## Notes

- Tiers are plain code, not a Paths step, so the workflow has only a few Salesforce steps.
- The staff search uses a SOQL `WHERE` clause; the reference is quoted and escaped. If more than one staff record matches, the first one is used.
- The created date is copied from the appointment as Salesforce sends it. If the transaction's date field is a Date (not Date/Time), Salesforce may reject the full timestamp; trim it to `YYYY-MM-DD` or switch the action to `create_record_utc`.
- Salesforce holds real records: never test against a production org, and name test records `[install-test] …`.
- To notify payroll, add a step after the transaction that posts it to Slack, Teams or email. To change the bonus rules, replace the fixed tiers with a percentage of the appointment value or a promotion-based amount.
