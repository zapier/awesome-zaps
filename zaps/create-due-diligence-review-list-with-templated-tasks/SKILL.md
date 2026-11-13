---
name: create-due-diligence-review-list-with-templated-tasks
description: Build a Zap on Zapier that turns an incoming review request into a dated ClickUp list from your due-diligence template, sets task due dates and custom fields, and assigns the requestor. Use when a corporate development or deal team starts a due-diligence review and wants the ClickUp list and its tasks set up from a webhook instead of by hand.
license: MIT
metadata:
  author: zapier
  summary: "When a due-diligence review request comes in, a new ClickUp list is created from your template, its tasks get the review dates, custom fields and requestor, so the deal team can start right away."
  apps: "Webhooks by Zapier, ClickUp"
  category: "Executives"
  job: "Corporate development"
  source: "https://zapier.com/automations/executives/corporate-development/due-diligence-management/create-due-diligence-review-list-with-templated-tasks"
---

# Create due diligence review list with templated tasks

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-due-diligence-review-list-with-templated-tasks. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a review request arrives at a catch hook (`webhook`, `hook_v2`). A deal-intake form or script posts to it.
2. **Code:** builds the list name from the month and year in the payload, or from today's date, as `[YYYY-MM] Client name`.
3. **`clickup`** creates the list from your due-diligence template in your space, so the template tasks come with it.
4. **`clickup`:** if a requestor email is given, looks up that person's ClickUp user.
5. **`clickup`:** reads the tasks in the new list. Tasks with "document" in the name get the document due date, all others get the review due date. Tasks are assigned to the requestor when found.
6. **`clickup`:** writes the payload's counterparty, contact, address and invoice values into the matching custom fields on each task.

Each task update and custom field write is its own step. One failed write does not stop the others; the run reports the count of failures.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                   | What goes there                                      |
| ------------------------- | ---------------------------------------------------- |
| `TEAM_ID`                 | The ClickUp workspace that holds the review lists    |
| `SPACE_ID`                | The ClickUp space the review lists are created in    |
| `TEMPLATE_ID`             | The list template that holds the due-diligence tasks |
| `COUNTERPARTY_FIELD_ID`   | The ClickUp custom field for the counterparty        |
| `CONTACT_NAME_FIELD_ID`   | The ClickUp custom field for the contact name        |
| `CONTACT_EMAIL_FIELD_ID`  | The ClickUp custom field for the contact email       |
| `ADDRESS_FIELD_ID`        | The ClickUp custom field for the address             |
| `INVOICE_NUMBER_FIELD_ID` | The ClickUp custom field for the invoice number      |

Also review the defaults with them: `DOCUMENT_TASK_MATCH` (`"document"`, the text that marks a task as a document task) and `ASSIGN_REQUESTOR` (`true` assigns the requestor to each task; set in `workflow.ts`).

Before building, confirm the intake form sends the payload fields the workflow reads: `client_name`, `counterparty`, `review_due_date`, `document_due_date`, `contact_name`, `contact_email`, `address`, `invoice_number`, `month`, `year` and `requestor_email`. Change the schema in `workflow.ts` if the form uses other names. Ask whether tasks should get document or review dates by name, as now, or by position in the template.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `clickup` to the user's ClickUp connection, for the workspace that holds the review lists. Use a test or integration account first. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test, in a ClickUp test space, with a template and list name you can delete afterwards:

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

Check that the list `[2026-11] [install-test] Example Co` exists in the space with the template's tasks, that each task has a due date (document tasks the document date), that the requestor is assigned, and that the custom fields show the sample values. If run-status tools aren't available, check the result in ClickUp directly. Ask the user to delete the test list; the agent does not delete it. Then publish, confirm the trigger is active, and give the user the webhook URL to point the intake form at.

## Notes

- This zap does not notify the requestor. The original automation's summary says they are notified, but its steps do not do that.
- Every run creates a new list. The original automation's duplicate check (match by client name and review date) is not built.
- ClickUp takes due dates as epoch milliseconds; the build converts the ISO dates in the payload with `Date.parse`.
- To send a kickoff email, add an email step after the task updates. If the template imports slowly and the task lookup comes back empty, add a short wait before it.
- Anyone with the webhook URL can create lists in the space, so never commit a real workspace, space, template, field ID or webhook URL.
