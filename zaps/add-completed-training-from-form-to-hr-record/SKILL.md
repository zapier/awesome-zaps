---
name: add-completed-training-from-form-to-hr-record
description: Build a Zap on Zapier that turns a submitted Google Form about completed classroom training into an HR training record, with the employee, course, completion date (DD/MM/YYYY), provider and status, posted to your HR system's endpoint. Use when training completions are collected by form and someone currently keys them into HR by hand.
license: MIT
metadata:
  author: zapier
  summary: "When a training form is submitted, the completed course is written to your HR system as a training record with the completion date in DD/MM/YYYY, so nobody re-keys it."
  apps: "Google Forms, Webhooks by Zapier"
  category: "Human Resources (HR)"
  job: "Learning development"
  source: "https://zapier.com/automations/human-resources-hr/learning-development/course-completion-tracking/add-completed-training-from-form-to-hr-record"
---

# Add completed training from form to HR record

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/add-completed-training-from-form-to-hr-record. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new Google Forms response (`google-forms`, `new_form_response`). The form to watch is chosen when the trigger is configured.
2. **Code:** reads the answers by question title. If the employee ID is blank, the run stops and writes nothing.
3. **Code:** formats the completion date as DD/MM/YYYY. ISO dates such as `2026-10-29`, which Google Forms sends for date questions, are rearranged directly. Other formats are parsed and read in UTC.
4. **Webhooks by Zapier** (`webhook`) POSTs one JSON record (`employee_id`, `training_type`, `training_date`, `provider`, `status`) to your HR system's endpoint, which creates the training record. The HR system matches the employee and creates the record if there is no match.

The Zap only adds records. It never changes or deletes one.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | What goes there                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `REPLACE_HR_WEBHOOK_URL` | The HR system's endpoint URL that creates training records (the Webhooks by Zapier POST target), from `config.ts` |

Also review the defaults with them: `FORM_FIELDS` in `workflow.ts` holds the form's question titles for employee ID, course name, completion date, provider and status. The code reads answers by these titles, so they must match the form exactly. If the HR system expects other field names, change the `record` object in `workflow.ts`.

Also ask which Google Form collects training completions (the trigger's form, picked from the user's Google Forms connection), and whether the employee ID is an HR payroll ID or another employee ID. The HR system does the matching either way.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-forms` (the trigger's connection) to the user's Google Forms connection for the account that owns the form. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-form-response.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with the HR endpoint set to a test endpoint and this sample as the input:

```json
{
  "Employee ID": "E-1042",
  "Course name": "Data handling basics",
  "Completion date": "2026-10-29",
  "Training provider": "Internal L&D",
  "Status": "Completed"
}
```

Check that the HR system received one record with `training_date` `29/10/2026`, the course and provider as entered, and the status as `Completed`. Then send the same input with the employee ID left blank and check that no record was created and the run reports `missing-employee-id`. If run-status tools aren't available, check the result in the HR system directly. Then publish, confirm the trigger is active, and ask the user to delete any test records, since the agent does not delete test data.

## Notes

- A blank employee ID stops the run with `missing-employee-id`. A failed HR POST fails the run, and nothing else is written.
- Only DD/MM/YYYY output is built in. Other date formats need a change to `formatTrainingDate`.
- To extend it: skip responses whose course is not on a configured list (add a check after the form read), or notify a program coordinator after a record is created.
- Never commit a real HR endpoint URL. Anyone with the URL can write training records to HR.
