---
name: send-ingestion-pipeline-status-to-team-channel-immediately
description: Build a Zap on Zapier that posts a short success or failure summary to a Slack channel whenever an ingestion pipeline posts its run status to a webhook. Use when data teams want loads and failures surfaced in Slack right away, without opening the pipeline's dashboard.
license: MIT
metadata:
  author: zapier
  summary: "When an ingestion pipeline reports a finished run or any errors, a short success and failure summary lands in your team's Slack channel right away."
  apps: "Webhooks by Zapier, Slack"
  category: "Data & Analytics"
  job: "Etl management"
  source: "https://zapier.com/automations/data-analytics/etl-management/pipeline-monitoring-alerting/send-ingestion-pipeline-status-to-team-channel-immediately"
---

# Send ingestion pipeline status to team channel immediately

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-ingestion-pipeline-status-to-team-channel-immediately. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a status payload arrives at a Webhooks by Zapier catch-raw hook (`webhook`, `hook_raw`). The pipeline or its CI step posts to it when a load finishes.
2. **Code:** reads `status`, `success_count`, `error_count` and, if present, `pipeline` from the body. If the status is not `completed` and there are no errors, it stops and posts nothing.
3. **Slack** posts one message to the team channel. The headline shows a warning when there are errors and a check mark when there are none. The body shows the status, succeeded count and failed count. No one is mentioned unless the user turns that on.

Only the status and counts are posted. The Zap never changes the pipeline or its data.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve channel names to IDs with the user's Slack connection; don't ask them to paste an ID you can look up.

| Setting         | What goes there                                                                        |
| --------------- | -------------------------------------------------------------------------------------- |
| `SLACK_CHANNEL` | The channel that gets the status summaries, looked up with the user's Slack connection |

Also review the defaults with them: `COMPLETED_STATUS` (`"completed"`, the status that means a run finished), and `MENTION_ON_ERRORS` in `workflow.ts` (`false`; set it to `true` to add `@channel` to error messages).

Before building, confirm what the pipeline sends. The code reads `status`, `success_count`, `error_count` and `pipeline` from the JSON body. If the sender uses other names, change them in `workflow.ts` first.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` to the user's Slack connection for the workspace that owns the channel. The webhook trigger needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook-raw.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the Slack action's fields with the user's connection before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with the channel set to one the user controls:

```json
{
  "body": "{\"pipeline\": \"[install-test] orders_ingest\", \"status\": \"completed\", \"success_count\": 120, \"error_count\": 3}"
}
```

Check that one message appears in the channel with the warning headline, `Status: completed · Succeeded: 120 · Failed: 3`, and the pipeline name. If run-status tools aren't available, read the channel directly. Then publish, confirm the trigger is active, and ask the user to delete the test message. The user deletes test data, not the agent.

## Notes

- After publishing, give the user the trigger's `webhook_url` (shown on the workflow in the editor) to paste into the pipeline's notification step. Anyone with that URL can post into the channel, so don't share it or commit it.
- The message says "completed" when there are no errors and "finished with errors" when there are. Anything other than `completed` with zero errors is skipped, whatever the pipeline's own status vocabulary.
- Each payload posts one message. If the sender posts several times, each post is a separate message.
- To send a direct message to an on-call user when errors occur, add a second Slack step behind the same error check.
- To keep an audit trail, add a Google Sheets or Zapier Tables step after the Slack step that writes each summary.
