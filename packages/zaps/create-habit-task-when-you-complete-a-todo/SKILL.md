---
name: create-habit-task-when-you-complete-a-todo
description: Build a Zapier Next Gen Zap that, each time a Todoist task is completed, creates a matching habit task in your habit tracker and scores it, so streaks and reward points stay current. Use when you track habits or rewards in a habit-tracking app or API and want finished to-dos to count without manual entry.
metadata:
  author: zapier
  summary: "When you finish a to-do in Todoist, a matching habit task is created in your habit tracker and scored, so your streaks and points update on their own."
  apps: "Todoist, Webhooks by Zapier"
  category: "Personal Productivity"
  job: "Health wellness tracking"
  source: "https://zapier.com/automations/personal-productivity/health-wellness-tracking/habit-tracking/create-habit-task-when-you-complete-a-todo"
---

# Create habit task when you complete a todo

## What it does

1. **Trigger:** a task is completed in Todoist (any project). Todoist's New Completed Task trigger starts the run.
2. **Webhooks by Zapier** sends a POST to your habit tracker's create-task endpoint with the task's title, note, completion time and Todoist task ID, plus your tracker's API token.
3. **Webhooks by Zapier** sends a POST to your habit tracker's score endpoint for the new habit task's ID, so it counts toward your streak and points right away.

If the create call returns no task ID, the run stops after step 2 and nothing is scored.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run. The habit tracker's request and response shapes are yours to confirm, since the workflow assumes the create call returns the new task's `id`.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Todoist, New Completed Task (`todoist`, `any_completed`). Leave the project blank to watch all projects. The trigger needs the user's Todoist connection.
2. **Connections:** none for the habit tracker. Webhooks by Zapier (`webhook`) needs no connection, so its `authentication_id` is `null`. Your tracker's token goes in the `HABIT_TRACKER_TOKEN` constant.
3. **Constants:**
   - `CREATE_TASK_URL`: your habit tracker's endpoint that creates a habit task.
   - `SCORE_TASK_URL`: your habit tracker's endpoint that scores a habit task. The new task's ID is added to the end of this URL, so `https://example.com/tasks` becomes `https://example.com/tasks/<id>`.
   - `HABIT_TRACKER_TOKEN`: your habit tracker's API token. Keep it private. Anyone who has the workflow source can read it.

## Ask the user

- What are the habit tracker's create-task and score endpoints, and which token should it use?
- Does the create call return the new task's ID as `id`? If it uses another field name, change the `created.data[0]?.id` line in `workflow.ts`.
- Should only certain Todoist projects or labels count? By default every completed task creates a habit task.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, with a real Todoist task completed in a test project:

```json
{
  "id": "1234567890",
  "content": "Morning walk",
  "note": "20 minutes around the block",
  "completed_at": "2026-10-29T08:30:00Z"
}
```

Confirm that one habit task named "Morning walk" appears in the habit tracker, that it is scored once, and that the run's output shows the same task ID for both requests. Then delete the test task from the habit tracker and Todoist.

## Customize

- **Limit to certain projects or labels:** add a check on the trigger's project or label fields before the create step, and skip tasks that don't match.
- **Lower-value scoring for recurring or low-impact tasks:** change the score request's body so it awards fewer points, or skip scoring for tasks with a given label.

## Notes

- The spec asks to match an existing habit task by title and completion date and create one only when none exists. This workflow creates one habit task per completed to-do and does not check for duplicates. Add a lookup step before the create step if your tracker needs that.
- Todoist's New Completed Task trigger may fire for recurring tasks each time they are completed.
- Never commit a real API token or endpoint URL. Anyone with them can change your habit records.
