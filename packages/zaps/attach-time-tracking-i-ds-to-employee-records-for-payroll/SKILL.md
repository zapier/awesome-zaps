---
name: attach-time-tracking-i-ds-to-employee-records-for-payroll
description: Build a Zapier Next Gen Zap that adds an incoming time-tracking ID to the matching employee's linking field in Airtable, so payroll and HR can reconcile timesheets. Use when a time-tracking tool sends a list of entries (record ID, email, full name) and each one should be attached to the employee in your HR table, without overwriting existing links.
metadata:
  author: zapier
  summary: "When time-tracking entries arrive, each one is attached to the matching employee record, so payroll can reconcile timesheets without manual lookups."
  apps: "Airtable, Webhooks by Zapier"
  category: "Human Resources (HR)"
  job: "Workforce operations"
  source: "https://zapier.com/automations/human-resources-hr/workforce-operations/time-tracking/attach-time-tracking-i-ds-to-employee-records-for-payroll"
---

# Attach time tracking IDs to employee records for payroll

## What it does

1. **Trigger:** a list of time-tracking entries arrives at a Webhooks by Zapier catch hook, each with a record ID, an email and a full name.
2. **Airtable** finds the employee whose email matches. If none matches, it looks for an exact full-name match.
3. If no employee matches, that entry is skipped and nothing is written. Employees are never created.
4. If the employee's linking field already contains the record ID, the entry is skipped. Otherwise the ID is appended to the existing links, and **Airtable** updates the employee record.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`. Expected payload: `{ "records": [ { "record_id", "email", "full_name" } ] }`.
2. **Connections** (each alias in the code is the app's slug):
   - `airtable`: the user's Airtable connection, for the account that can edit the employee table.
3. **Constants** (all in `workflow.ts`, each with a comment):
   - `AIRTABLE_BASE_ID`: the base ID from the base's URL.
   - `EMPLOYEE_TABLE`: the table name that holds employees.
   - `EMAIL_FIELD`: the employee column matched first, against the entry's email.
   - `FULL_NAME_FIELD`: the employee column used as an exact-match fallback.
   - `TIME_TRACKING_LINK_FIELD`: the multi-link column the record ID is appended to.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point the time-tracking tool at.

## Ask the user

- Which Airtable base and table hold employees, and which columns hold email, full name and the time-tracking link?
- Does the time-tracking tool send `records` as a list of `{ record_id, email, full_name }`? If it uses other names, change the schema before installing.
- Should an unmatched entry stay skipped (the default) or create an employee? The spec's Customize section lists this as a later option.

## Test

When testing, use a draft test run (`run_workflow_draft` in Zapier MCP) against a base with a test employee table, never the live HR table. Use this sample:

```json
{
  "records": [
    {
      "record_id": "rec_TEST_0001",
      "email": "test.employee@example.com",
      "full_name": "Test Employee"
    }
  ]
}
```

Check that the employee's linking field gained `rec_TEST_0001` with its existing links kept. Run it a second time to confirm the entry is skipped as already linked. Then tell the user to restore any row that held real data.

## Customize

- **Create a new employee record on no match:** add a Create Record step on the no-match path.
- **Send an optional HR notification when multiple matches are returned:** add a Slack or email step. The current find step returns only the first match, so this needs a list step first.

## Notes

- Matching uses the first Airtable record returned. If two employees share an email, the first one wins.
- The Airtable output shape (`id`, `fields`) and the dynamic link-field key were not read back from a live run; check them on the first test.
- Never commit a real base ID, table name or webhook URL in `workflow.ts`.
