---
name: trigger-environment-cleanup-when-sprint-task-is-tagged
description: Build a Zap on Zapier that sends a teardown request to your removal API when a teardown tag is added to a sprint task in an Asana project, so ephemeral environments are reclaimed without manual steps. Use when a team creates per-task environments and wants them removed by tagging the task.
license: MIT
metadata:
  author: zapier
  summary: "When a teardown tag is added to a sprint task, your removal API gets the task's ID and title, so the environment for that task is reclaimed without anyone doing it by hand."
  apps: "Asana, Webhooks by Zapier"
  category: "Engineering"
  job: "Dev ops"
  source: "https://zapier.com/automations/engineering/dev-ops/environment-management/trigger-environment-cleanup-when-sprint-task-is-tagged"
---

# Trigger environment cleanup when sprint task is tagged

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/trigger-environment-cleanup-when-sprint-task-is-tagged. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** an Asana "Tag Added to Task" trigger (`asana`, `task_tagged`) fires when the teardown tag is added to a task in the configured project.
2. **Webhooks by Zapier** POSTs JSON to your removal API with `task_id` (the Asana task ID), `summary` (the task name) and `action: "remove"`.

The trigger only fires for the one tag and one project you set, so no separate filter step runs.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                      | Where                                   | What goes there                                      |
| ---------------------------- | --------------------------------------- | ---------------------------------------------------- |
| `REPLACE_ASANA_WORKSPACE_ID` | `triggers/task-tagged.ts`, `workspace`  | The Asana workspace that holds the sprint project    |
| `REPLACE_ASANA_PROJECT_ID`   | `triggers/task-tagged.ts`, `project_id` | The sprint project whose tasks get the teardown tag  |
| `REPLACE_ASANA_TAG_ID`       | `triggers/task-tagged.ts`, `tag_id`     | The tag that means "tear this down"                  |
| `REPLACE_REMOVAL_API_URL`    | `config.ts`                             | The removal endpoint that receives the teardown POST |

Also check that the teardown tag is one only the teardown process uses, since any tag on the chosen project fires the workflow when it is added. If the removal API expects different field names, change the `data` object in `workflow.ts` before installing.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `asana` (the trigger's account, from `triggers/task-tagged.ts`) to the user's Asana connection. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/task-tagged.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with this sample input. It is shaped like an Asana task record, and the name marks it as a test:

```json
{
  "gid": "1213589447295574",
  "name": "[install-test] synthetic teardown sample"
}
```

Check that the `post-removal-request` step shows a POST to the removal URL with `task_id`, `summary` and `action: "remove"` in the body. If run-status tools aren't available, check the result in your removal API directly. Then publish, confirm the trigger is active, and tag a real test task in the chosen project to confirm one run starts from the trigger. Don't run that tag test against a project with live environments. Ask the user to delete the test data, not the agent.

## Notes

- The Asana trigger fires on each tag event, so the same task can start more than one removal if its tag is added twice. Make the removal API idempotent.
- Never commit a real removal API URL. Anyone who can reach it can trigger teardowns.
- To customize, add a step after the POST that logs responses to a sheet, or a Slack or email step that reports failed or completed teardowns.
