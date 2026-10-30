---
name: create-monthly-release-notes-task-and-launch-checklist
description: Build a Zapier Next Gen Zap that creates a monthly release notes task in Asana on the first of each month, files it in your recurring emails section and adds a dated subtask for the newsletter send date. Use when a product or marketing team publishes release notes or a monthly newsletter and wants the recurring task and its checklist created automatically.
metadata:
  author: zapier
  summary: "Each month, a release notes task is created from your Asana template, filed in your recurring emails section, and given a subtask to set the newsletter send date."
  apps: "Schedule by Zapier, Asana"
  category: "Product"
  job: "Digital product operations"
  source: "https://zapier.com/automations/product/digital-product-operations/release-notes-management/create-monthly-release-notes-task-and-launch-checklist"
---

# Create monthly release notes task and launch checklist

## What it does

1. **Trigger:** Schedule by Zapier fires on day 1 of every month at 9:00 AM.
2. **Asana** looks for a task named `Monthly release notes <Month> <Year>` in your project. If one already exists, the run stops and creates nothing, so a rerun never duplicates the task.
3. **Asana** creates that task from your task template, with the month and year in its name.
4. **Asana** finds the recurring emails section in the project and moves the new task into it.
5. **Asana** adds a subtask to the new task, assigned to the owner, due on the 5th of the month, to determine the newsletter send date.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Schedule by Zapier, Every Month (`schedule`, `everyMonth`). Set the trigger's day of the month to `1` and its time to `9:00 AM`. It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `asana`: the user's Asana connection, for the account that owns the project.
3. **Constants:**
   - `WORKSPACE_ID`: the Asana workspace that holds the project.
   - `PROJECT_ID`: the Asana project where the monthly task goes.
   - `TEMPLATE_ID`: the task template the monthly task is created from.
   - `SECTION_NAME`: the name of the recurring emails section in that project.
   - `OWNER_ID`: the Asana user ID assigned the send-date subtask.
   - `SUBTASK_DUE_DAY`: the day of the month the subtask is due. Defaults to `5`.
   - `TASK_NAME_PREFIX`: the start of the monthly task's name. Defaults to `Monthly release notes`.
4. Test with the steps below, then publish, wait until the trigger is active, and confirm the trigger's schedule matches what the user wants.

## Ask the user

- Which Asana workspace and project hold the monthly task, and which task template should it be created from?
- What is the exact name of the recurring emails section in that project?
- Who should be assigned the send-date subtask? Give their Asana user ID.
- Should the task be due or the subtask be due on a day other than the 5th? Should the trigger fire at a time other than 9:00 AM, or in a timezone other than the account's?

## Test

Run the draft as a test (`run_workflow_draft` in Zapier MCP) with an empty input. The trigger sends no data, so the test input is `{}`. Use a test project and template, or ones you are happy to change, because the test creates a real task.

Check that:

- Asana has one new task named `Monthly release notes <Month> <Year>` in the project, created from the template.
- That task sits in the recurring emails section.
- The task has one subtask, `Determine newsletter send date for <Month> <Year>`, assigned to the owner and due on the 5th.
- A second run in the same month creates nothing and returns `task-already-exists`.

## Customize

- **Localized or ISO titles:** add a formatting step to use another language's month names or ISO dates in the task name.
- **Reminder when the subtask is created:** send a Slack or email message when the subtask is created, in place of or as well as assigning it.

## Notes

- The month and year come from the time the workflow runs, not from the trigger's data. The run is on day 1, so this matches the month the task is for.
- If the section is not found, the task is still created but is not moved into a section. The run returns `section-not-found` with the task ID, so check the project.
- The match on an existing task is exact, so a renamed task does not stop a duplicate. Rename the task only if you also want the next run to create a new one.
- Never commit a real workspace, project, template or user ID in a shared copy of this file.
