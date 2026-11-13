---
name: send-real-time-integration-failure-alerts-to-data-channel
description: Build a Zap on Zapier that posts a Zap error alert to a Slack data channel as soon as one of your Zaps fails, with the Zap's title, the error message and a link to its task history. Use when a data or integrations team wants failing pipelines announced in one channel so owners can act quickly.
license: MIT
metadata:
  author: zapier
  summary: "When one of your Zaps fails, a short alert with its name, the error and a link to its history lands in your data channel right away."
  apps: "Zapier Manager, Slack"
  category: "Data & Analytics"
  job: "Etl management"
  source: "https://zapier.com/automations/data-analytics/etl-management/pipeline-monitoring-alerting/send-real-time-integration-failure-alerts-to-data-channel"
---

# Send real-time integration failure alerts to data channel

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-real-time-integration-failure-alerts-to-data-channel. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Zap error on any Zap you own, from Zapier Manager (`zapier-manager`, `zap_error_alert`).
2. **Filter:** if `ONLY_SERVICES` lists apps, alerts for other services stop there and post nothing. The default is empty, so every error passes.
3. **Message:** the code builds a headline (`:rotating_light:` plus the Zap title), the error message, and an "Open task history" link.
4. **Slack** posts that message once to the data channel. Nothing is sent to anyone directly.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve channel names to IDs with the user's Slack connection; don't ask them to paste an ID you can look up.

| Setting                 | What goes there                                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_SLACK_CHANNEL` | The channel that receives the failure alerts, set in `config.ts`. Confirm the connected Slack account can post there. |

Also review these defaults with the user:

- `ONLY_SERVICES` (in `workflow.ts`): app names to alert for, such as `["Slack", "Snowflake"]`. Leave empty to alert for every Zap error.
- `MENTION_PREFIX` (in `config.ts`): text before each alert, such as `<!channel> `, to ping the channel. Leave empty for no mention.
- Whether to limit alerts to some Zaps, such as one folder. If so, set `folder` or `node_id` in the trigger's `params`. Leave them empty to cover every Zap.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` to the user's Slack connection for the workspace that has the data channel; it posts the alerts. Zapier Manager needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/zap-error-alert.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it. The trigger needs no connection, so its `authentication_id` is `null`.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run before publishing. Use a test channel, not the live data channel:

```json
{
  "title": "[install-test] My Awesome Zap",
  "message": "Error: Boom!",
  "service": "Code by Zapier",
  "outage": false,
  "zap_link": "https://zapier.com/app/editor/1?source=zapier_manager",
  "task_history_link": "https://zapier.com/app/history?root_id=1&source=zapier_manager",
  "count": 1,
  "root_id": 1
}
```

Confirm that the Slack step returns `ok: true` and that the posted text reads `:rotating_light: *[install-test] My Awesome Zap*`, then `Error: Boom!`, then a link labelled "Open task history". The run output's `permalink` should point at that message. If run-status tools aren't available, check the result in Slack directly. Then publish, confirm the trigger is active, and tell the user that nothing fires until a real Zap of theirs fails. Ask the user to delete the test message; the agent does not delete test data.

## Notes

- Zapier Manager's alert payload has no severity field, so filter by `service` (the app that failed) to tell failures apart.
- The alert's `outage` flag is passed in the input but not used. Add a branch on it if outages need different handling.
- To create an incident ticket for high-severity failures, or direct message a pipeline owner on repeated failures, add a step after the Slack post. Track repeats in a sheet or table first.
- Never commit a real channel ID or the trigger's `webhook_url`.
