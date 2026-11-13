---
name: update-loan-records-from-external-loan-status-feed
description: Build a Zap on Zapier that takes a loan status update from an external feed by webhook, finds the matching loan in Salesforce by its external loan ID, and updates the loan's status, property, finance and date fields. Use when a loan servicer or feed pushes loan status changes and the CRM loan records should stay current without manual edits. Does not create new loans.
license: MIT
metadata:
  author: zapier
  summary: "When the loan servicer sends a status change, the matching loan in your CRM is updated with the new status, dates, property and finance figures, so the team sees current loan data."
  apps: "Webhooks by Zapier, Salesforce"
  category: "Finance"
  job: "Loan management"
  source: "https://zapier.com/automations/finance/loan-management/loan-servicing/update-loan-records-from-external-loan-status-feed"
---

# Update loan records from external loan status feed

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-loan-records-from-external-loan-status-feed. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a loan status update arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). The loan feed posts to it.
2. **Salesforce** Find Record looks up the loan whose external loan ID field matches `loan_id` in the payload. If there is no match, the run stops and writes nothing. It never creates a loan.
3. **Code** skips the run unless the payload carries a status or a next-payment or maturity date. It then normalizes dates to `YYYY-MM-DD`, and currency and rate text to numbers.
4. **Salesforce** Update Record (UTC) writes the status, property address, principal balance, interest rate and key dates onto the found loan.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                      | What goes there                                                      |
| ---------------------------- | -------------------------------------------------------------------- |
| `LOAN_OBJECT`                | The Salesforce object (API name) that holds the loans                |
| `EXTERNAL_LOAN_ID_FIELD`     | The loan object field that stores the external loan ID from the feed |
| `STATUS_FIELD`               | The loan object field for the loan status picklist                   |
| `PROPERTY_STREET_FIELD`      | The loan object field for the property street address                |
| `PROPERTY_CITY_FIELD`        | The loan object field for the property city                          |
| `PROPERTY_STATE_FIELD`       | The loan object field for the property state                         |
| `PROPERTY_POSTAL_CODE_FIELD` | The loan object field for the property postal code                   |
| `PRINCIPAL_BALANCE_FIELD`    | The loan object field for the principal balance                      |
| `INTEREST_RATE_FIELD`        | The loan object field for the interest rate                          |
| `NEXT_PAYMENT_DATE_FIELD`    | The loan object field for the next payment date                      |
| `MATURITY_DATE_FIELD`        | The loan object field for the maturity date                          |

Before turning it on, confirm the feed sends these payload keys: `loan_id`, `status`, `property_street`, `property_city`, `property_state`, `property_postal_code`, `principal_balance`, `interest_rate`, `next_payment_date` and `maturity_date`. If it uses other names, rename the keys in `InputSchema` in `workflow.ts`. Also confirm whether the feed sends dates as `MM/DD/YYYY` or ISO text. Both parse; anything else becomes `null` and is not written.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `salesforce` to the user's Salesforce connection for the account that owns the loan records. The Webhooks catch hook needs no connection, so its `authentication_id` is `null`.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger, if it has one, before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test (`run_workflow_draft`) on a sandbox Salesforce connection, against a test loan the user has created with the external loan ID `LN-100234`:

```json
{
  "loan_id": "LN-100234",
  "status": "Current",
  "property_street": "12 Harbor Way",
  "property_city": "Austin",
  "property_state": "TX",
  "property_postal_code": "78701",
  "principal_balance": "$245,310.50",
  "interest_rate": "6.125",
  "next_payment_date": "11/01/2026",
  "maturity_date": "2046-10-01"
}
```

Check that the test loan's status, address, balance, rate and both dates changed, and that no other loan changed. Then run one payload with an unknown `loan_id` and check that the run skips with `loan-not-found`. If run-status tools aren't available, check the test loan in Salesforce directly. Ask the user to delete the test loan, not the agent. Then publish, confirm the trigger is active, and do the real thing once with a feed update for a loan that exists.

## Notes

- Nothing is created on a no-match run; loans must already exist in Salesforce.
- A payload with no status or date change is skipped, so routine finance-only updates don't overwrite the record.
- Dates and currency are normalized in code before the write. Amounts with unparseable text are written as `null`.
- Anyone with the webhook URL can change loan records. Don't commit the real webhook URL, object name or field keys.
- To extend it: create a loan when no match is found instead of stopping, or notify owners on major status changes with an email or team message step after the update.
