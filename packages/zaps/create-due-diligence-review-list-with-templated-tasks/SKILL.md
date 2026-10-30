---
name: create-due-diligence-review-list-with-templated-tasks
description: Build a Zapier Next Gen Zap that turns an incoming review request into a dated ClickUp list from your due-diligence template, sets task due dates and custom fields, and assigns the requestor. Use when a corporate development or deal team starts a due-diligence review and wants the ClickUp list and its tasks set up from a webhook instead of by hand.
metadata:
  author: zapier
  summary: "When a due-diligence review request comes in, a new ClickUp list is created from your template, its tasks get the review dates, custom fields and requestor, so the deal team can start right away."
  apps: "Webhooks by Zapier, ClickUp"
  category: "Executives"
  job: "Corporate development"
  source: "https://zapier.com/automations/executives/corporate-development/due-diligence-management/create-due-diligence-review-list-with-templated-tasks"
---

# Create due diligence review list with templated tasks

## What it does

1. **Trigger:** a review request arrives at a Webhooks by Zapier catch hook (a deal-intake form or script posts to it).
2. **Code:** builds the list name from the month and year in the payload, or from today's date, as `[YYYY-MM] Client name`.
3. **ClickUp:** creates the list from your due-diligence template in your space, via ClickUp's create-list-from-template API endpoint, so the template tasks come with it.
4. **ClickUp:** if a requestor email is given, looks up that person's ClickUp user.
5. **ClickUp:** reads the tasks in the new list. Each task gets a due date: tasks with "document" in the name get the document due date, all others get the review due date. Tasks are assigned to the requestor when found.
6. **ClickUp:** writes the payload's counterparty, contact, address and invoice fields into the matching custom fields on each task.

Each task update and each custom field write is its own step. One failed write does not stop the others; the run reports the count of failures.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `clickup`: the user's ClickUp connection, for the workspace that holds the review lists. Use a test or integration account first.
3. **Constants** (each has a comment in `workflow.ts`):
   - `TEAM_ID`: the ClickUp workspace ID.
   - `SPACE_ID`: the ClickUp space the lists are created in.
   - `TEMPLATE_ID`: the list template with the due-diligence tasks.
   - `CUSTOM_FIELD_IDS`: payload field to ClickUp custom field ID. Only fields with a value in the payload are written.
   - `DOCUMENT_TASK_MATCH`: text that marks a task as a document task. Defaults to `"document"`.
   - `ASSIGN_REQUESTOR`: `true` assigns the requestor to each task.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point the intake form at.

## Ask the user

- Which ClickUp workspace, space and list template hold the due-diligence set? Give the workspace ID, space ID and template ID.
- Which ClickUp custom fields should hold the counterparty, contact, address and invoice values? Give their field IDs.
- Which payload field names does the intake form send? The example in `workflow.ts` uses `client_name`, `counterparty`, `review_due_date`, `document_due_date`, `contact_name`, `contact_email`, `address`, `invoice_number`, `month`, `year` and `requestor_email`. Change the schema if the form uses other names.
- Should tasks be matched to document or review dates by name, as now, or by position in the template?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, in a ClickUp test space, with a template and list name you can delete afterwards.

```json
{
  "client_name": "[install-test] Example Co",
  "counterparty": "[install-test] Counterparty Ltd",
  "review_due_date": "2026-11-30",
  "document_due_date": "2026-12-15",
  "contact_name": "Test Contact",
  "contact_email": "test@example.com",
  "address": "1 Test Street",
  "invoice_number": "INV-TEST-1",
  "month": 11,
  "year": 2026,
  "requestor_email": "you@example.com"
}
```

Confirm that the list `[2026-11] [install-test] Example Co` exists in the space with the template's tasks, that each task has a due date (document tasks the document date), that the requestor is assigned, and that the custom fields show the sample values. Then delete the test list.

## Customize

- **Kickoff email:** send the requestor a short email with the formatted dates and the list link once the list is ready. Add an email step after the task updates.
- **Delay after list creation:** if the template imports slowly and the task lookup comes back empty, add a short wait before the task lookup.

## Notes

- The original automation summary says the requestor is notified, but its steps do not. This zap does not notify anyone.
- The original automation's duplicate check (match by client name and review date, and create a list only on no match) is not built. Every run creates a new list.
- ClickUp takes due dates as epoch milliseconds. The build converts the ISO dates in the payload with `Date.parse`.
- Never commit a real workspace, space, template, field ID or webhook URL. Anyone with the webhook URL can create lists in the space.
