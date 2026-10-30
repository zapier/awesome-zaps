---
name: update-experiment-record-status-from-task-changes
description: Build a Zapier Next Gen Zap that keeps an experiments table's status in step with ClickUp task changes, matching each record by its task permalink and creating a record when none exists. Use when a product team tracks feature experiments in Airtable and wants the experiment status to follow the delivery task's status without manual edits.
metadata:
  author: zapier
  summary: "When a ClickUp task changes status, its matching experiment record in your Airtable table is updated to the same status, so reports and handoffs show current delivery progress."
  apps: "ClickUp, Airtable"
  category: "Product"
  job: "Product experimentation"
  source: "https://zapier.com/automations/product/product-experimentation/feature-experiment-tracking/update-experiment-record-status-from-task-changes"
---

# Update experiment record status from task changes

## What it does

1. **Trigger:** a ClickUp task changes (ClickUp, Task Changes). The run reads the task's permalink, title, assigned owner and status.
2. **Airtable** searches the experiments table for a record whose permalink column exactly matches the task permalink.
3. If no record matches, **Airtable** creates one with the task's permalink, title, owner and status, and the run ends.
4. If a record matches and its status already equals the task's status, the run stops and writes nothing.
5. Otherwise **Airtable** updates the matching record: status, title, owner and permalink.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run. Airtable column keys depend on the table, so check them against the user's table.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** ClickUp, Task Changes (`clickup`, `tasks`). Set its Workspace field to `CLICKUP_TEAM_ID`, and leave Include Subtasks off.
2. **Connections** (each alias in the code is the app's slug):
   - `clickup`: the user's ClickUp connection, for the trigger.
   - `airtable`: the user's Airtable connection, for the base that holds the experiments table.
3. **Constants:**
   - `CLICKUP_TEAM_ID`: the ClickUp workspace ID to watch.
   - `AIRTABLE_BASE_ID`: the base ID from the Airtable URL.
   - `AIRTABLE_TABLE_NAME`: the experiments table's name.
   - `PERMALINK_FIELD`, `STATUS_FIELD`, `TITLE_FIELD`, `OWNER_FIELD`: the column names in the user's table. The code matches records on the permalink column.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user where to see the workflow.

## Ask the user

- Which ClickUp workspace holds the delivery tasks, and what is its ID?
- Which Airtable base and table are the experiments, and which columns hold the task permalink, status, title and owner?
- Should a status change also notify the task's owner in chat or by comment? This template does not do that; it can be added later (see Customize).

## Test

Run a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, using a task that exists in the user's ClickUp workspace and a test row in a test table. Use this sample input, with `url` set to that task's permalink:

```json
{
  "url": "https://app.clickup.com/t/YOUR_TASK_ID",
  "name": "Checkout copy test",
  "status": "In review",
  "assignee": "Jordan Lee"
}
```

Check that only the matching record changed: its status now reads `In review`, and its title, owner and permalink match the task. Then run it again with the same input and check that the run stops without writing. If the test table is real data, restore the row afterwards.

## Customize

- **Swap the source tool:** replace ClickUp with any project tool that exposes a task permalink or ID.
- **Swap the database:** replace Airtable with any team database or CRM used for experiment tracking.
- **Notify the owner:** after the update, add a chat message or task comment to the assigned owner about the status change.

## Notes

- Records are matched on the permalink only. If two rows share a permalink, the first one found is updated.
- A record is created only when no row has the permalink, so a task that is never tracked in the table is not added until its first change.
- Keep the status values in the table and in ClickUp spelled the same, or every change will look different and update the row.
