---
name: create-monthly-release-notes-task-and-launch-checklist
description: Build a Zap on Zapier that creates a monthly release notes task in Asana on the first of each month, files it in your recurring emails section and adds a dated subtask for the newsletter send date. Use when a product or marketing team publishes release notes or a monthly newsletter and wants the recurring task and its checklist created automatically.
license: MIT
metadata:
  author: zapier
  summary: "Each month, a release notes task is created from your Asana template, filed in your recurring emails section, and given a subtask to set the newsletter send date."
  apps: "Schedule by Zapier, Asana"
  category: "Product"
  job: "Digital product operations"
  source: "https://zapier.com/automations/product/digital-product-operations/release-notes-management/create-monthly-release-notes-task-and-launch-checklist"
---

# Create monthly release notes task and launch checklist

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-monthly-release-notes-task-and-launch-checklist. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** the schedule (`schedule`, `everyMonth`) fires on day 1 of every month at 9:00 AM.
2. **Asana** looks for a task named `Monthly release notes <Month> <Year>` in your project.
3. **Asana** creates that task from your task template, with the month and year in its name.
4. **Asana** finds the recurring emails section in the project and moves the new task into it.
5. **Asana** adds a subtask to the new task, assigned to the owner, due on the 5th of the month, to determine the newsletter send date.

A rerun in the same month creates nothing: an existing task with the same name stops the run.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting        | What goes there                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------- |
| `WORKSPACE_ID` | The Asana workspace that holds the project, looked up with the user's Asana connection         |
| `PROJECT_ID`   | The Asana project where the monthly task goes, looked up with the user's Asana connection      |
| `TEMPLATE_ID`  | The task template the monthly task is created from, looked up with the user's Asana connection |
| `SECTION_NAME` | The exact name of the recurring emails section in that project                                 |
| `OWNER_ID`     | The Asana user assigned the send-date subtask, looked up with the user's Asana connection      |

Also review the defaults with them: `TASK_NAME_PREFIX` in `config.ts` (`Monthly release notes`), `SUBTASK_DUE_DAY` in `workflow.ts` (`5`), and the trigger in `triggers/every-month.ts` (day 1 at 9:00 AM, in the account's timezone).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `asana` to the user's Asana connection for the account that owns the project. The schedule trigger needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/every-month.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with an empty input. The trigger sends no data, so the test input is:

```json
{}
```

Use a test project and template, not the team's real ones, because the test creates a real task. Check that:

- Asana has one new task named `Monthly release notes <Month> <Year>` in the project, created from the template.
- That task sits in the recurring emails section.
- The task has one subtask, `Determine newsletter send date for <Month> <Year>`, assigned to the owner and due on the 5th.
- A second run in the same month creates nothing and returns `task-already-exists`.

If run-status tools aren't available, check the result in Asana directly. Then publish, confirm the trigger is active, and confirm its schedule matches what the user wants. Ask the user to delete the test task; the agent does not delete test data.

## Notes

- The month and year come from the time the workflow runs, not from the trigger's data. The run is on day 1, so this matches the month the task is for.
- If the section is not found, the task is still created but is not moved into a section. The run returns `section-not-found` with the task ID, so check the project.
- The match on an existing task is exact, so a renamed task does not stop a duplicate. Rename the task only if you also want the next run to create a new one.
- To extend it: add a formatting step for localized or ISO titles, or send a Slack or email reminder when the subtask is created.
- Never commit a real workspace, project, template or user ID in a shared copy of this file.
