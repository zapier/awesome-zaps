---
name: copy-new-tasks-into-your-primary-task-list
description: Build a Zap on Zapier that copies each new task from a secondary Google Tasks list into your primary task list, so you keep one actionable task stream. Use when tasks land in a side list (a project, a shared list, a capture list) and you want them mirrored into your main list without copying by hand.
license: MIT
metadata:
  author: zapier
  summary: "Each new task you add to a secondary Google Tasks list is copied into your primary list, so everything you need to act on sits in one place."
  apps: "Google Tasks"
  category: "Personal Productivity"
  job: "Personal administration"
  source: "https://zapier.com/automations/personal-productivity/personal-administration/personal-task-management/copy-new-tasks-into-your-primary-task-list"
---

# Copy new tasks into your primary task list

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/copy-new-tasks-into-your-primary-task-list. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new task is added to the secondary Google Tasks list (`google-tasks`, `tasks`).
2. **Google Tasks** skips the task if it has no title or is already marked completed.
3. **Google Tasks** looks for a task with the same title in your primary list. If one exists with the same due date, the run stops and nothing is copied.
4. **Google Tasks** creates the task in your primary list with the same title, notes and due date.

The Zap only creates tasks in the primary list. It never edits or deletes anything in the secondary list.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve list names to IDs with the user's Google Tasks connection; don't ask them to paste an ID you can look up.

| Setting                | What goes there                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `SOURCE_TASK_LIST_ID`  | The secondary Google Tasks list to watch. The same list goes in the trigger's Task List |
| `PRIMARY_TASK_LIST_ID` | The primary list, where the copies are created                                          |

Also review the default with them: Include Assigned Tasks on the trigger stays off, so tasks assigned to them from Google Docs or Gmail are not copied. Turn it on only if they want those copied too.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-tasks` to the user's Google Tasks connection for the account that owns both lists.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/tasks.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's Task List to the same list as `SOURCE_TASK_LIST_ID`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connection and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample once as a draft test:

```json
{
  "id": "example-task-1",
  "title": "Renew passport",
  "notes": "Check the expiry date first",
  "due": "2026-12-01T00:00:00Z",
  "status": "needsAction"
}
```

Check that:

- A task titled "Renew passport" appears in the primary list, with the same notes and due date.
- Running the same sample again creates no second task; the run ends as already mirrored.
- A sample with `"status": "completed"` creates nothing.

If run-status tools aren't available, check the result in Google Tasks directly. Ask the user to delete the test task from the primary list; the agent doesn't delete test data.

## Notes

- Matching is by title first, then by exact due date. Two different tasks with the same title and due date are treated as one.
- Completed tasks are never copied. Tasks with no title are skipped.
- To alert on high-priority items, add a Slack message step after the copy, for tasks whose title or notes contain a priority marker.
- To keep the source visible, append the secondary list's name to the copied task's notes.
