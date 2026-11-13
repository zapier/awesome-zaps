---
name: update-experiment-record-status-from-task-changes
description: Build a Zap on Zapier that keeps an experiments table's status in step with ClickUp task changes, matching each record by its task permalink and creating a record when none exists. Use when a product team tracks feature experiments in Airtable and wants the experiment status to follow the delivery task's status without manual edits.
license: MIT
metadata:
  author: zapier
  summary: "When a ClickUp task changes status, its matching experiment record in your Airtable table is updated to the same status, so reports and handoffs show current delivery progress."
  apps: "ClickUp, Airtable"
  category: "Product"
  job: "Product experimentation"
  source: "https://zapier.com/automations/product/product-experimentation/feature-experiment-tracking/update-experiment-record-status-from-task-changes"
---

# Update experiment record status from task changes

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-experiment-record-status-from-task-changes. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a ClickUp task changes (`clickup`, `tasks`). The run reads the task's permalink, title, assigned owner and status.
2. **Airtable** searches the experiments table for a record whose permalink column exactly matches the task permalink.
3. If no record matches, **Airtable** creates one with the task's permalink, title, owner and status, and the run ends.
4. If a record matches and its status already equals the task's status, the run stops and writes nothing.
5. Otherwise **Airtable** updates the matching record: status, title, owner and permalink.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting               | What goes there                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| `CLICKUP_TEAM_ID`     | The ClickUp workspace to watch. Also set the trigger's Workspace field to it, and leave Include Subtasks off |
| `AIRTABLE_BASE_ID`    | The Airtable base that holds the experiments table: the ID from its URL                                      |
| `AIRTABLE_TABLE_NAME` | The experiments table's name inside that base                                                                |

Also review the defaults with them: `PERMALINK_FIELD`, `STATUS_FIELD`, `TITLE_FIELD` and `OWNER_FIELD` are the column names in `config.ts` (`Task permalink`, `Status`, `Task title`, `Owner`). They must match the user's table exactly, and records are matched on the permalink column.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `airtable` (the base that holds the experiments table) to the user's Airtable connection, and `clickup` (the trigger) to the user's ClickUp connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/tasks.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with `url` set to the permalink of a test task in the user's ClickUp workspace and the test table in place of the real experiments table:

```json
{
  "url": "https://app.clickup.com/t/8600000001",
  "name": "Checkout copy test",
  "status": "In review",
  "assignee": "Jordan Lee"
}
```

Check that only the matching record changed: its status now reads `In review`, and its title, owner and permalink match the task. Then run it again with the same input and check that the run stops without writing. If run-status tools aren't available, check the result in Airtable directly. Ask the user to delete the test rows, since the agent doesn't delete test data. Then publish, confirm the trigger is active, and tell the user where to see the workflow.

## Notes

- Records are matched on the permalink only. If two rows share a permalink, the first one found is updated.
- A record is created only when no row has the permalink, so a task that is never tracked in the table is not added until its first change.
- Keep the status values spelled the same in the table and in ClickUp, or every change will look different and update the row.
- To notify the task's owner after an update, add a chat message or task comment step. To use another tool, swap ClickUp for any project tool that exposes a task permalink, or Airtable for any team database.
