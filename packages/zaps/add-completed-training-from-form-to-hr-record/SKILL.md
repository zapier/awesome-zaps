---
name: add-completed-training-from-form-to-hr-record
description: Build a Zapier Next Gen Zap that turns a submitted Google Form about completed classroom training into an HR training record, with the employee, course, completion date (DD/MM/YYYY), provider and status, posted to your HR system's endpoint. Use when training completions are collected by form and someone currently keys them into HR by hand.
metadata:
  author: zapier
  summary: "When a training form is submitted, the completed course is written to your HR system as a training record with the completion date in DD/MM/YYYY, so nobody re-keys it."
  apps: "Google Forms, Webhooks by Zapier"
  category: "Human Resources (HR)"
  job: "Learning development"
  source: "https://zapier.com/automations/human-resources-hr/learning-development/course-completion-tracking/add-completed-training-from-form-to-hr-record"
---

# Add completed training from form to HR record

## What it does

1. **Trigger:** a new Google Forms response (`new_form_response`). The form to watch is chosen when the trigger is configured.
2. **Code:** reads the answers by question title. If the employee ID is blank, the run stops and writes nothing.
3. **Code:** formats the completion date as DD/MM/YYYY. ISO dates such as `2026-10-29`, which Google Forms sends for date questions, are rearranged directly. Other formats are parsed and read in UTC.
4. **Webhooks by Zapier, POST:** sends one JSON record (`employee_id`, `training_type`, `training_date`, `provider`, `status`) to your HR system's endpoint, which creates the training record. The HR system matches the employee and creates the record if there is no match.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top.

1. **Trigger:** Google Forms, New Form Response (`google-forms`, `new_form_response`). It needs the user's Google Forms connection, and the form to watch is picked from that connection. Set the trigger's `authentication_id` to that connection.
2. **Connections:** Google Forms is the only app with auth. Webhooks by Zapier needs no connection, so its `authentication_id` is `null`.
3. **Constants:**
   - `HR_WEBHOOK_URL`: the HR system endpoint that creates training records. Leave it as the placeholder until you have the URL.
   - `FORM_FIELDS`: the form's question titles for employee ID, course name, completion date, provider and status. The code reads answers by these titles, so match them to the form exactly.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the trigger's webhook details if the form needs one.

## Ask the user

- Which Google Form collects training completions, and which Google account connection should the trigger use?
- What are the exact question titles for employee ID, course name, completion date, provider and status?
- What is the HR system's endpoint URL, and does it take JSON as shown? If it expects other field names, change the `record` object in `workflow.ts`.
- Should the employee ID be an HR payroll ID or an employee ID? The HR system does the matching either way.

## Test

The steps below are for when the trigger and HR endpoint are set up.

Use this sample as the test input, with an employee ID that exists in your HR system and a test HR endpoint if you have one:

```json
{
  "Employee ID": "E-1042",
  "Course name": "Data handling basics",
  "Completion date": "2026-10-29",
  "Training provider": "Internal L&D",
  "Status": "Completed"
}
```

Check that the HR system received one record with `training_date` `29/10/2026`, the course and provider as entered, and the status as `Completed`. Then send the same input with the employee ID left blank and check that no record was created and the run reports `missing-employee-id`.

## Customize

- **Filter by course type:** skip responses whose course is not on a configured list. Add a check after the form read.
- **Notify a program coordinator:** after a record is created, send a message to the coordinator on success.

## Notes

- The workflow stops with `missing-employee-id` when the employee ID is blank. A failed HR POST fails the run, and nothing else is written.
- Only DD/MM/YYYY output is built in. Other date formats need a change to `formatTrainingDate`.
- Never commit a real HR endpoint URL. Anyone with the URL can write training records to HR.
