---
name: copy-new-tasks-into-your-primary-task-list
description: Build a Zapier Next Gen Zap that copies each new task from a secondary Google Tasks list into your primary task list, so you keep one actionable task stream. Use when tasks land in a side list (a project, a shared list, a capture list) and you want them mirrored into your main list without copying by hand.
metadata:
  author: zapier
  summary: "Each new task you add to a secondary Google Tasks list is copied into your primary list, so everything you need to act on sits in one place."
  apps: "Google Tasks"
  category: "Personal Productivity"
  job: "Personal administration"
  source: "https://zapier.com/automations/personal-productivity/personal-administration/personal-task-management/copy-new-tasks-into-your-primary-task-list"
---

# Copy new tasks into your primary task list

## What it does

1. **Trigger:** a new task is added to the secondary Google Tasks list you choose.
2. **Google Tasks** skips the task if it has no title or is already marked completed.
3. **Google Tasks** looks for a task with the same title in your primary list. If one exists with the same due date, the run stops and nothing is copied.
4. **Google Tasks** creates the task in your primary list with the same title, notes and due date.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**Check the fields first:** with your own connection, inspect the trigger and the actions (`get_trigger_fields`, `inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before you publish.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Tasks, New Task (`tasks`). Set its Task List to the secondary list you want watched. Leave Include Assigned Tasks off.
2. **Connections** (each alias in the code is the app's slug):
   - `google-tasks`: your Google Tasks connection. Use the account that owns both lists.
3. **Constants:**
   - `SOURCE_TASK_LIST_ID`: the secondary list to watch. Set the same ID as the trigger's Task List.
   - `PRIMARY_TASK_LIST_ID`: your primary list, where copies are created.

## Ask the user

- Which Google Tasks list holds the new tasks, and which is the primary list?
- Should tasks assigned to you (from Google Docs or Gmail) be copied too? The default is no.

## Test

Send one sample task through the trigger, or add a task with this shape to the secondary list:

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

Then delete any test task you added to the primary list.

## Customize

- **Alert on high-priority items:** add a Slack message step after the copy, for tasks whose title or notes contain a priority marker.
- **Keep the source visible:** append the secondary list's name to the copied task's notes, so you can see where each task came from.

## Notes

- Matching is by title first, then by exact due date. Two different tasks with the same title and due date are treated as one.
- Completed tasks are never copied. Tasks with no title are skipped.
