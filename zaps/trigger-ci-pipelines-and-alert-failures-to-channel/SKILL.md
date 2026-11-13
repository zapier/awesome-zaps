---
name: trigger-ci-pipelines-and-alert-failures-to-channel
description: Build a Zap on Zapier that starts a CI pipeline when a Git push lands on main or master, and posts an alert to a team Slack channel when the run fails. Use when a Git push to main or master should start a CI pipeline and a failed run should post an alert to a team Slack channel. Triggered by a catch-hook POST from your repo or CI system.
license: MIT
metadata:
  author: zapier
  summary: "When code is pushed to your main branch, a CI pipeline starts, and if it fails, the team channel gets a message with a link."
  apps: "Webhooks by Zapier, Slack"
  category: "Engineering"
  job: "Dev ops"
  source: "https://zapier.com/automations/engineering/dev-ops/ci-cd-pipeline-management/trigger-ci-pipelines-and-alert-failures-to-channel"
---

# Trigger CI pipelines and alert failures to channel

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/trigger-ci-pipelines-and-alert-failures-to-channel. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Webhooks by Zapier catch hook receives a POST with the repository name, owner, branch and topics.
2. **Filter:** continues only for the `main` or `master` branch, and skips repositories tagged with an excluded topic. Other pushes end the run with no external call.
3. **CI start:** POSTs the repository, owner and branch to your CI pipeline endpoint and reads the pipeline `id` from the reply.
4. **Wait and poll:** waits 90 seconds, then GETs the pipeline status.
5. **Alert:** if the status is `failed` or `error`, posts one message to a Slack channel with the status and a link to the pipeline. Other statuses post nothing.

Anyone with the catch-hook URL can start a CI run, so keep it private.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve channel names to IDs with the user's Slack connection; don't ask them to paste an ID you can look up.

| Setting           | What goes there                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `CI_PIPELINE_URL` | The endpoint of your CI system that starts a pipeline. The workflow POSTs to it, and it must return JSON with the pipeline `id` |
| `CI_STATUS_URL`   | Your CI status endpoint. The pipeline id is appended as a path segment, and the JSON reply has a `status` field                 |
| `SLACK_CHANNEL`   | The channel that gets failure alerts, looked up to its ID (C…) with the user's Slack connection                                 |

Also review the defaults with them: `CI_BRANCHES` (default `main` and `master`), `EXCLUDED_TOPICS` (default `no-ci`), `ALLOWED_TOPICS` (empty means all repositories), `POLL_DELAY_SECONDS` (default 90), `FAILED_STATUSES` (default `failed` and `error`), and `MENTION_ON_FAILURE` (off; turn on only to mention a Slack user group, with `MENTION_TEXT`).

Confirm two things before building. The CI system's endpoints must match the shape above: a start endpoint returning JSON with `id`, and a status endpoint returning JSON with `status`. The sender must post `repository`, `owner`, `branch` and `topics` in the body; if it uses other field names, change the input schema in `workflow.ts` first.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` to the user's Slack connection for the workspace with the alert channel. Webhooks by Zapier needs no connection; the catch hook and the CI calls are unauthenticated.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it as a draft test (`run_workflow_draft`) with the workflow disabled. These two samples should skip without calling any app:

Sample 1, a non-CI branch:

```json
{
  "repository": "install-test-sample-repo",
  "owner": "install-test",
  "branch": "feature/install-test",
  "topics": ["service"]
}
```

Expected: `{ "skipped": true, "reason": "branch-not-ci" }`, with no operations run.

Sample 2, an excluded repository on `main`:

```json
{
  "repository": "install-test-sample-repo",
  "owner": "install-test",
  "branch": "main",
  "topics": ["no-ci"]
}
```

Expected: `{ "skipped": true, "reason": "repo-excluded" }`, with no operations run.

Then test the full path. Point `CI_PIPELINE_URL` and `CI_STATUS_URL` at a test pipeline, run a `main` payload whose pipeline fails, and check that one alert with the status and the pipeline link appears in the test channel. If run-status tools aren't available, check the test channel in Slack directly. Ask the user to delete the test messages; the agent does not delete them. Then publish, confirm the trigger is active, and turn the Zap on.

## Notes

- The repository topics must come from the sender's payload. The GitHub "Find Repository" step from the original spec is not included.
- To vary it, add a repository-specific queue delay for large services, or route failure posts to on-call users or several channels by service tag.
- Turn the Zap on only after the full path has been tested.
