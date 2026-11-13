---
name: update-legal-task-from-address-verification-record-intake
description: Build a Zap on Zapier that adds address verification results to an existing ClickUp legal task when a new row lands in a Zapier Tables intake table. Use when a legal or operations team records address checks in a Zapier table and wants the matching ClickUp task updated without copying data by hand.
license: MIT
metadata:
  author: zapier
  summary: "When an address verification record is added to your intake table, the matching ClickUp legal task is looked up and updated, so the case team sees the result without re-entering it."
  apps: "Zapier Tables, ClickUp"
  category: "Legal"
  job: "Legal operations"
  source: "https://zapier.com/automations/legal/legal-operations/legal-intake-management/update-legal-task-from-address-verification-record-intake"
---

# Update legal task from address verification record intake

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-legal-task-from-address-verification-record-intake. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new record is added to the address verification intake table in Zapier Tables (`zapier-tables`, `new_record`).
2. **ClickUp** looks up the task whose ID is in the record's task reference field. If there is no task reference, or no verification result, the run stops and writes nothing.
3. **ClickUp** updates that task. If no task matches the reference, the run stops.
4. **Zapier Tables** deletes the processed intake row, but only when `DELETE_PROCESSED_RECORDS` is turned on.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                   | What goes there                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_INTAKE_TABLE_ID` | The Zapier Tables table that receives the address verification intake rows. The trigger watches it, and processed rows are deleted from it. |
| `REPLACE_CLICKUP_TEAM_ID` | The ClickUp workspace that holds the legal tasks.                                                                                           |

Also review with them the default `DELETE_PROCESSED_RECORDS` in `workflow.ts`. It is `false`, so each intake row stays in the table for manual review. Set it to `true` only after the ClickUp update writes the verification result to the task.

Prerequisite questions:

- Which fields of the intake table hold the ClickUp task reference (`f1`), the verification result (`f2`) and the address summary (`f3`)? The sample in this folder uses those names.
- Which ClickUp task fields should receive the verification result and the address summary (a status, a custom field, or the task notes)? The update step does not write them until the user says.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `clickup` to the user's ClickUp connection for the workspace that holds the legal tasks, and `zapier-tables` to their Zapier Tables connection for the intake table. The trigger uses `zapier-tables` too. No app needs a connection beyond these two.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-record.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, with `f1` set to the ID of a test task the user controls in their ClickUp test workspace:

```json
{
  "record_id": "sample-record-0001",
  "new": {
    "data": {
      "f1": "sample-task-id",
      "f2": "verified",
      "f3": "1 Test Street, Testville"
    }
  }
}
```

Confirm that the matching ClickUp task was found and updated, and that no other task changed. If `DELETE_PROCESSED_RECORDS` is on, confirm the intake row is gone. Use a test table and a test task while you check, not live legal records. If run-status tools aren't available, check the result in ClickUp directly. The user deletes the test data, not the agent.

## Notes

- To keep intake rows for audit, leave `DELETE_PROCESSED_RECORDS` set to `false`, so each row stays in the table for manual review.
- To notify the team on high-priority outcomes, add an email or Slack step after the ClickUp update.
- To write the verification result and address summary into the task's status or custom fields, map them once the field keys are known.
- Only the task reference and the verification result are read. The address summary is not written anywhere yet.
- If two tasks share the same ID, the first one found is updated.
- Never commit a real workspace ID or table ID.
