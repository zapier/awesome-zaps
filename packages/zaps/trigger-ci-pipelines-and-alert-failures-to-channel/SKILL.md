---
name: trigger-ci-pipelines-and-alert-failures-to-channel
description: Use when a Git push to main or master should start a CI pipeline and a failed run should post an alert to a team Slack channel. Triggered by a catch-hook POST from your repo or CI system.
metadata:
  author: zapier
  summary: "When code is pushed to your main branch, a CI pipeline starts, and if it fails, the team channel gets a message with a link."
  apps: "Webhooks by Zapier, Slack"
  category: "Engineering"
  job: "Dev ops"
  source: "https://zapier.com/automations/engineering/dev-ops/ci-cd-pipeline-management/trigger-ci-pipelines-and-alert-failures-to-channel"
---

# Trigger CI pipelines and alert failures to channel

## What it does

1. **Trigger:** a Webhooks by Zapier catch hook receives a POST with the repository name, owner, branch and topics.
2. **Filter:** continues only for the `main` or `master` branch, and skips repositories tagged with an excluded topic. Other pushes end the run with no external call.
3. **CI start:** POSTs the repository, owner and branch to your CI pipeline endpoint and reads the pipeline `id` from the reply.
4. **Wait and poll:** waits 90 seconds, then GETs the pipeline status.
5. **Alert:** if the status is `failed` or `error`, posts one message to a Slack channel with the status and a link to the pipeline. Other statuses post nothing.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook` / `hook_v2`). No connection, so `authentication_id` is `null`.
2. **Connections** (the alias is the app key):
   - `slack`: your Slack workspace connection, for the account that posts alerts.
3. **Constants** (top of `workflow.ts`):
   - `CI_BRANCHES`: branches that start a run. Default `["main", "master"]`.
   - `EXCLUDED_TOPICS`: repository topics that skip the run. Default `["no-ci"]`.
   - `ALLOWED_TOPICS`: if set, only repositories with one of these topics run. Empty means all.
   - `POLL_DELAY_SECONDS`: wait before polling. Default `90`.
   - `CI_PIPELINE_URL`: your CI endpoint that starts a pipeline and returns JSON with an `id`.
   - `CI_STATUS_URL`: your CI status endpoint. The pipeline id is appended as a path segment, and the reply has a `status` field.
   - `FAILED_STATUSES`: statuses that count as failed. Default `["failed", "error"]`.
   - `SLACK_CHANNEL`: the Slack channel ID for alerts.
   - `MESSAGE_PREFIX`: leave empty.
   - `MENTION_ON_FAILURE` and `MENTION_TEXT`: off by default. Turn on only if you want a user group mentioned.

## Ask the user

- Which CI system runs the pipelines, and what are its start and status endpoints? The code assumes a start endpoint that returns JSON with `id`, and a status endpoint that returns JSON with `status`.
- Which Slack channel gets alerts? Use its channel ID.
- Should repositories be filtered by topic, and which topics mark a repository as excluded?
- Should the alert mention anyone? If so, which user group?
- Does the sender post `repository`, `owner`, `branch` and `topics` in the body? If it uses other field names, change the input schema before installing.

## Test

Draft test runs (`run_workflow_draft`), with the workflow disabled:

Run 1, non-CI branch:

```json
{
  "repository": "install-test-sample-repo",
  "owner": "install-test",
  "branch": "feature/install-test",
  "topics": ["service"]
}
```

Expected: `{ "skipped": true, "reason": "branch-not-ci" }`, no operations.

Run 2, excluded repository on `main`:

```json
{
  "repository": "install-test-sample-repo",
  "owner": "install-test",
  "branch": "main",
  "topics": ["no-ci"]
}
```

Expected: `{ "skipped": true, "reason": "repo-excluded" }`, no operations.

Both runs completed as expected. The end-to-end path (CI POST, status GET, Slack alert) still needs a test: point `CI_PIPELINE_URL` and `CI_STATUS_URL` at a test pipeline, run a `main` payload with a failing pipeline, and confirm one `[install-test]` message in the test channel.

## Customize

- **Variation:** add a repository-specific queue delay for large services.
- **Variation:** route failure posts to on-call users or multiple channels based on service tags.

## Notes

- The original spec's GitHub "Find Repository" step is not included. The repository topics must come from the sender's payload.
- The workflow was published enabled, then disabled. Turn it on only after setting the constants above and testing the full path.
- Anyone with the catch-hook URL can start a CI run, so keep it private.
