---
name: send-real-time-integration-failure-alerts-to-data-channel
description: Build a Zapier Next Gen Zap that posts a Zap error alert to a Slack data channel as soon as one of your Zaps fails, with the Zap's title, the error message and a link to its task history. Use when a data or integrations team wants failing pipelines announced in one channel so owners can act quickly.
metadata:
  author: zapier
  summary: "When one of your Zaps fails, a short alert with its name, the error and a link to its history lands in your data channel right away."
  apps: "Zapier Manager, Slack"
  category: "Data & Analytics"
  job: "Etl management"
  source: "https://zapier.com/automations/data-analytics/etl-management/pipeline-monitoring-alerting/send-real-time-integration-failure-alerts-to-data-channel"
---

# Send real-time integration failure alerts to data channel

## What it does

1. **Trigger:** a Zap error on any Zap you own, from Zapier Manager (`zap_error_alert`).
2. **Filter:** if `ONLY_SERVICES` lists apps, alerts for other services stop there and post nothing. The default is empty, so every error passes.
3. **Message:** the code builds a headline (`:rotating_light:` plus the Zap title), the error message, and a "Open task history" link.
4. **Slack** posts that message once to the data channel. Nothing is sent to anyone directly.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Zapier Manager, New Zap Error (`zapier-manager`, `zap_error_alert`). It needs no connection, so its `authentication_id` is `null`. Leave `params` empty to alert for every Zap you own; set `folder` or `node_id` to narrow it.
2. **Connections** (each alias in the code is the app's slug):
   - `slack`: the Slack connection for the workspace that has the data channel.
3. **Constants:**
   - `SLACK_CHANNEL`: the channel ID, such as `C0123456`, not the channel name.
   - `ONLY_SERVICES`: app names to alert for, such as `["Slack", "Snowflake"]`. Leave empty for all.
   - `MENTION_PREFIX`: text before each alert, such as `<!channel> `. Leave empty for no mention.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the Zap-error setup they need (nothing fires until a real Zap of theirs fails).

## Ask the user

- Which Slack channel is the data channel? Give its channel ID, and check that the connected Slack account can post there.
- Which apps should trigger alerts? Leave the list empty to alert for every Zap error.
- Should the alert ping the channel (`<!channel>`), or stay quiet?
- Do they want the alert limited to some Zaps, such as one folder? If so, set `folder` or `node_id` on the trigger.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a test channel, not the live data channel:

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

Confirm that the Slack step returns `ok: true` and that the posted text reads `:rotating_light: *[install-test] My Awesome Zap*`, then `Error: Boom!`, then a link labelled "Open task history". The run output's `permalink` should point at that message. Delete the test message in Slack afterwards.

## Customize

- **Create an incident ticket** in your tracker for high-severity failures. Add a step after the Slack post.
- **Direct message a pipeline owner** on repeated failures. Track repeats in a sheet or table first.

## Notes

- Zapier Manager's alert payload has no severity field. Filter by `service` (the app that failed) instead.
- The alert's `outage` flag is passed in the input but not used. Add a branch on it if outages need different handling.
- Never commit a real channel ID or webhook URL. The trigger's `webhook_url` is for the trigger itself and should not be shared.
