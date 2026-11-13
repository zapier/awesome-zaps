---
name: create-habit-task-when-you-complete-a-todo
description: Build a Zap on Zapier that, each time a Todoist task is completed, creates a matching habit task in your habit tracker and scores it, so streaks and reward points stay current. Use when you track habits or rewards in a habit-tracking app or API and want finished to-dos to count without manual entry.
license: MIT
metadata:
  author: zapier
  summary: "When you finish a to-do in Todoist, a matching habit task is created in your habit tracker and scored, so your streaks and points update on their own."
  apps: "Todoist, Webhooks by Zapier"
  category: "Personal Productivity"
  job: "Health wellness tracking"
  source: "https://zapier.com/automations/personal-productivity/health-wellness-tracking/habit-tracking/create-habit-task-when-you-complete-a-todo"
---

# Create habit task when you complete a todo

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-habit-task-when-you-complete-a-todo. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a task is completed in Todoist, in any project (`todoist`, `any_completed`).
2. **Webhooks by Zapier** sends a POST to your habit tracker's create-task endpoint with the task's title, note, completion time and Todoist task ID, plus your tracker's API token.
3. **Webhooks by Zapier** sends a POST to your habit tracker's score endpoint for the new habit task's ID, so it counts toward your streak and points right away.

If the create call returns no task ID, the run stops after step 2 and nothing is scored.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting               | What goes there                                                                                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CREATE_TASK_URL`     | The habit tracker's endpoint that creates a habit task (POST)                                                                                                         |
| `SCORE_TASK_URL`      | The habit tracker's endpoint that scores a habit task. The new task's ID is added to the end, so `https://example.com/tasks` becomes `https://example.com/tasks/<id>` |
| `HABIT_TRACKER_TOKEN` | The habit tracker's API token. Keep it private: anyone who has the workflow source can read it                                                                        |

Also review the defaults with them: by default every completed Todoist task, in any project, creates a habit task. Ask whether only certain projects or labels should count.

Confirm that the create call returns the new task's ID as `id`. If it uses another field name, change the `created.data[0]` line in `workflow.ts` to read that field.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** the workflow's actions use no connection alias. Bind `todoist` (the trigger's account) to the user's Todoist connection. Webhooks by Zapier needs no connection, so its `authentication_id` is `null`.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/any-completed.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match. The request and response shapes of the habit tracker are the user's to confirm.

## Test it

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, pointed at a habit tracker test account:

```json
{
  "id": "1234567890",
  "content": "Morning walk",
  "note": "20 minutes around the block",
  "completed_at": "2026-10-29T08:30:00Z"
}
```

Check that one habit task named "Morning walk" appears in the habit tracker, that it is scored once, and that the run's output shows the same task ID for both requests. If run-status tools aren't available, check the result in your habit tracker directly. The user deletes the test data in the habit tracker and Todoist, not the agent.

## Notes

- Todoist's New Completed Task trigger may fire for recurring tasks each time they are completed.
- The Zap creates one habit task per completed to-do and does not check for duplicates. To match an existing habit task by title and completion date first, add a lookup step before the create step.
- To limit it to certain projects or labels, add a check on the trigger's project or label fields before the create step.
- For lower-value scoring on recurring or low-impact tasks, change the score request's body, or skip scoring for tasks with a given label.
- Never commit a real API token or endpoint URL. Anyone with them can change your habit records.
