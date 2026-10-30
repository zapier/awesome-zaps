---
name: send-ingestion-pipeline-status-to-team-channel-immediately
description: Use when an ingestion pipeline posts its run status to a webhook and the team wants a short success/error summary in a Slack channel right away. Fits data teams who watch loads by hand or want failures surfaced without opening the pipeline's dashboard.
metadata:
  author: zapier
  summary: "When an ingestion pipeline reports a finished run or any errors, a short success and failure summary lands in your team's Slack channel right away."
  apps: "Webhooks by Zapier, Slack"
  category: "Data & Analytics"
  job: "Etl management"
  source: "https://zapier.com/automations/data-analytics/etl-management/pipeline-monitoring-alerting/send-ingestion-pipeline-status-to-team-channel-immediately"
---

# Send ingestion pipeline status to team channel immediately

## What it does

1. **Trigger:** a status payload arrives at a Webhooks by Zapier catch-raw hook. The pipeline or its CI step posts to it when a load finishes.
2. **Code (inline):** reads `status`, `success_count`, `error_count` and, if present, `pipeline` from the body. If the status is not `completed` and there are no errors, it stops and posts nothing.
3. **Slack** posts one message to the team channel. The headline shows a warning when there are errors and a check mark when there are none. The body shows the status, succeeded count and failed count. No one is mentioned unless you turn that on.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Raw Hook (`webhook`, action `hook_raw`). No connection, so `authentication_id` is `null` and `params` is empty.
2. **Connections** (each alias in the code is the app's slug):
   - `slack`: the Slack connection for the workspace that owns the channel.
3. **Constants:**
   - `SLACK_CHANNEL`: the channel ID (not the name). Get it from the channel's details in Slack, or from the Slack channel picker in Zapier.
   - `COMPLETED_STATUS`: the status string that means a run finished. Defaults to `"completed"`.
   - `MENTION_ON_ERRORS`: `false` by default. Set it to `true` to add `@channel` to error messages.
4. Test with the steps below, then publish and give the user the trigger's `webhook_url` (shown on the workflow in the editor) to paste into the pipeline's notification step.

## Ask the user

- Which Slack channel should get the summary, and which Slack connection should post it? The build used a placeholder channel ID.
- What does the pipeline send? The code reads `status`, `success_count`, `error_count` and `pipeline` from the JSON body. If the sender uses other names, change them in `workflow.ts` before installing.
- Should errors @-mention the channel? It is off by default.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a test channel, not the team's:

```json
{
  "body": "{\"pipeline\": \"[install-test] orders_ingest\", \"status\": \"completed\", \"success_count\": 120, \"error_count\": 3}"
}
```

Confirm that one message appears in the channel with the warning headline, `Status: completed · Succeeded: 120 · Failed: 3`, and the pipeline name. This sample was run and the message was read back from Slack.

## Customize

- **Send a direct message to an on-call user** when errors occur: add a second Slack step, behind the same error check, that uses the send-direct-message action.
- **Write each summary to a logging table or archive** for later audit: add a Google Sheets or Zapier Tables step after the Slack step.

## Notes

- The message says "completed" when there are no errors and "finished with errors" when there are. It does not check the pipeline's own status vocabulary, so anything other than `completed` with zero errors is skipped.
- Only one message is posted per payload. If the sender posts several times, each post is a separate message.
- Never commit a real channel ID or webhook URL. Anyone with the webhook URL can post into the channel.
