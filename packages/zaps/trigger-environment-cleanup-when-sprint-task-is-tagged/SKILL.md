---
name: trigger-environment-cleanup-when-sprint-task-is-tagged
description: Build a Zapier Next Gen Zap that sends a teardown request to your removal API when a teardown tag is added to a sprint task in an Asana project, so ephemeral environments are reclaimed without manual steps. Use when a team creates per-task environments and wants them removed by tagging the task.
metadata:
  author: zapier
  summary: "When a teardown tag is added to a sprint task, your removal API gets the task's ID and title, so the environment for that task is reclaimed without anyone doing it by hand."
  apps: "Asana, Webhooks by Zapier"
  category: "Engineering"
  job: "Dev ops"
  source: "https://zapier.com/automations/engineering/dev-ops/environment-management/trigger-environment-cleanup-when-sprint-task-is-tagged"
---

# Trigger environment cleanup when sprint task is tagged

## What it does

1. **Trigger:** an Asana "Tag Added to Task" trigger fires when the teardown tag is added to a task in the configured project.
2. **Webhooks by Zapier** POSTs JSON to your removal API with `task_id` (the Asana task ID), `summary` (the task name) and `action: "remove"`.

The trigger only fires for the one tag and one project you set, so no separate filter step runs.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constant below and the trigger settings.

1. **Trigger:** Asana, Tag Added to Task (`asana`, action `task_tagged`), on your Asana connection. Set these trigger params:
   - `workspace`: your Asana workspace ID (the test build used `1060121423582`).
   - `project_id`: the Asana project to watch (the test build used `1202707318967873`).
   - `tag_id`: the Asana tag that means "tear this down" (the test build used `78482953817892`, the existing "test" tag).
2. **Connections:**
   - `asana`: the user's Asana connection. The alias is the app key, as in the code.
   - Webhooks by Zapier needs no connection.
3. **Constants:**
   - `REMOVAL_API_URL`: the removal endpoint that receives the POST. The published test build pointed it at `https://httpbin.org/post`. Replace it with the real endpoint, which the deployed copy in this folder leaves as `YOUR_REMOVAL_API_URL`.

## Ask the user

- Which Asana project holds the sprint tasks, and which tag means "tear down this environment"?
- What is the removal API URL, and what does it expect in the body? The POST sends `task_id`, `summary` and `action`. If the API wants different field names, change the `data` object in `workflow.ts` before installing.
- Should the trigger's tag be one that only the teardown process uses? Any tag on the chosen project fires the workflow when it is added.

## Test

Run a draft test (`run_workflow_draft` in Zapier MCP) with this sample input before publishing. It is shaped like an Asana task record, and the name marks it as a test:

```json
{
  "gid": "1213589447295574",
  "name": "[install-test] synthetic teardown sample"
}
```

Check the run output: the `post-removal-request` step should show a POST to your removal URL with `task_id`, `summary` and `action: "remove"` in the body. Then tag a real test task in the chosen project and confirm one run starts from the trigger. Do not do the tag test against a project with live environments.

## Customize

- **Log responses to a team table** for auditing: add a step after the POST that writes the response to a sheet or table.
- **Notify on failure or confirmation:** add a Slack or email step after the POST, to report failed or completed teardowns.

## Notes

- The Asana trigger fires on each tag event, so the same task can start more than one removal if its tag is added twice. Make the removal API idempotent.
- Never commit a real removal API URL. Anyone who can reach it can trigger teardowns.
