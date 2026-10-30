---
name: update-legal-task-from-address-verification-record-intake
description: Build a Zapier Next Gen Zap that adds address verification results to an existing ClickUp legal task when a new row lands in a Zapier Tables intake table. Use when a legal or operations team records address checks in a Zapier table and wants the matching ClickUp task updated without copying data by hand.
metadata:
  author: zapier
  summary: "When an address verification record is added to your intake table, the matching ClickUp legal task is looked up and updated, so the case team sees the result without re-entering it."
  apps: "Zapier Tables, ClickUp"
  category: "Legal"
  job: "Legal operations"
  source: "https://zapier.com/automations/legal/legal-operations/legal-intake-management/update-legal-task-from-address-verification-record-intake"
---

# Update legal task from address verification record intake

## What it does

1. **Trigger:** a new record is added to your address verification intake table in Zapier Tables.
2. **ClickUp** looks up the task whose ID is in the record's task reference field. If there is no task reference, or no verification result, the run stops and writes nothing.
3. **ClickUp** updates that task. If no task matches the reference, the run stops.
4. **Zapier Tables** deletes the processed intake row, but only when `DELETE_PROCESSED_RECORDS` is turned on.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**Check the fields first:** with your own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Zapier Tables, New Record (`zapier-tables`, `new_record`). Use your own Zapier Tables connection; its `authentication_id` is that connection's ID.
2. **Connections** (each alias in the code is the app's slug):
   - `clickup`: your ClickUp connection, for the workspace that holds the legal tasks.
   - `zapier-tables`: your Zapier Tables connection, for the intake table.
3. **Constants:**
   - `INTAKE_TABLE_ID`: the Zapier Tables table that receives the intake rows. Used by the trigger and by the delete step.
   - `CLICKUP_TEAM_ID`: your ClickUp workspace (team) ID.
   - `DELETE_PROCESSED_RECORDS`: `false` by default. Set it to `true` only after the ClickUp update writes the verification result to the task.
4. Test with the steps below, then publish, wait until the trigger is active, and point your intake form or script at the table.

## Ask the user

- Which Zapier Tables table holds the intake rows, and which of its fields hold the ClickUp task reference, the verification result and the address summary? The sample in this folder uses `f1`, `f2` and `f3`.
- Which ClickUp workspace holds the legal tasks?
- Which ClickUp task fields should receive the verification result and the address summary (a status, a custom field, or the task notes)? The update step does not write them until you say.
- Should processed intake rows be deleted after the update, or kept for audit?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, with a task reference that exists in your ClickUp workspace:

```json
{
  "record_id": "YOUR_RECORD_ID",
  "new": {
    "data": {
      "f1": "YOUR_CLICKUP_TASK_ID",
      "f2": "verified",
      "f3": "1 Test Street, Testville"
    }
  }
}
```

Confirm that the matching ClickUp task was found and updated, and that no other task changed. If `DELETE_PROCESSED_RECORDS` is on, confirm the intake row is gone. Use a test table and a test task while you check, not live legal records.

## Customize

- **Keep the intake rows for audit:** leave `DELETE_PROCESSED_RECORDS` set to `false`, so each row stays in the table for manual review.
- **Notify the team** on high-priority outcomes: add an email or Slack step after the ClickUp update.
- **Write the verification result and address summary** into the task's status or custom fields once you have their field keys.

## Notes

- Only the task reference and the verification result are read. The address summary is not written anywhere yet.
- If two tasks share the same ID, the first one found is updated.
- Never commit a real workspace ID, table ID or webhook URL. Replace the `YOUR_...` placeholders in `workflow.ts` with your own values.
