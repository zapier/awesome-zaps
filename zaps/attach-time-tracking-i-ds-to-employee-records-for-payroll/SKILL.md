---
name: attach-time-tracking-i-ds-to-employee-records-for-payroll
description: Build a Zap on Zapier that adds an incoming time-tracking ID to the matching employee's linking field in Airtable, so payroll and HR can reconcile timesheets. Use when a time-tracking tool sends a list of entries (record ID, email, full name) and each one should be attached to the employee in your HR table, without overwriting existing links.
license: MIT
metadata:
  author: zapier
  summary: "When time-tracking entries arrive, each one is attached to the matching employee record, so payroll can reconcile timesheets without manual lookups."
  apps: "Airtable, Webhooks by Zapier"
  category: "Human Resources (HR)"
  job: "Workforce operations"
  source: "https://zapier.com/automations/human-resources-hr/workforce-operations/time-tracking/attach-time-tracking-i-ds-to-employee-records-for-payroll"
---

# Attach time tracking IDs to employee records for payroll

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/attach-time-tracking-i-ds-to-employee-records-for-payroll. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a list of time-tracking entries arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`), each with a record ID, an email and a full name.
2. **Airtable** finds the employee whose email matches. If none matches, it looks for an exact full-name match.
3. If no employee matches, that entry is skipped and nothing is written.
4. If the employee's linking field already contains the record ID, the entry is skipped. Otherwise the ID is appended to the existing links, and **Airtable** updates the employee record.

The Zap never creates employees and never overwrites existing links.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                            | What goes there                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| `REPLACE_AIRTABLE_BASE_ID`         | The Airtable base that holds employee records                                         |
| `REPLACE_EMPLOYEE_TABLE`           | The table in that base that holds employees                                           |
| `REPLACE_EMAIL_FIELD`              | The employee column matched first, against the entry's email                          |
| `REPLACE_FULL_NAME_FIELD`          | The employee column matched as an exact-match fallback, against the entry's full name |
| `REPLACE_TIME_TRACKING_LINK_FIELD` | The multi-link column the time-tracking record ID is appended to                      |

Before turning it on, confirm two things with the user:

- Does the time-tracking tool send `records` as a list of `{ record_id, email, full_name }`? If it uses other names, change the schema in `workflow.ts` before installing.
- Should an unmatched entry stay skipped (the default) or create an employee? Creating one is a change to the no-match path; see Notes.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `airtable` to the user's Airtable connection for the account that can edit the employee table. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test against a base with a test employee table, never the live HR table:

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

Check that the employee's linking field gained `rec_TEST_0001` with its existing links kept. Run it a second time and check that the entry is skipped as already linked. If run-status tools aren't available, check the result in Airtable directly. Then publish, confirm the trigger is active, and ask the user to delete the test data, not the agent, and to restore any row that held real data.

## Notes

- Matching uses the first Airtable record returned. If two employees share an email, the first one wins.
- The Airtable output shape (`id`, `fields`) and the dynamic link-field key were not read back from a live run; check them on the first test.
- To create an employee on no match, add a Create Record step on the no-match path.
- To notify HR when several employees match, add a list step before the Slack or email step, since the find step returns only the first match.
- Never commit a real base ID, table name or webhook URL in `workflow.ts`.
