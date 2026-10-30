---
name: update-environment-usage-and-log-from-deploy-reaction
description: Build a Zapier Next Gen Zap that, when someone adds a deploy reaction (such as :rocket:) to a Slack message naming an environment, marks that environment in use in a Google Sheets registry, appends a timestamped row to a usage log tab, and replies in the message's thread. Use when an engineering or dev ops team tracks shared environments (staging, QA, preview) in a sheet and claims them from Slack.
metadata:
  author: zapier
  summary: "React with a rocket to a deploy message in Slack and the environment it names is marked in use in your registry sheet, logged with a timestamp, and confirmed in the thread."
  apps: "Slack, Google Sheets"
  category: "Engineering"
  job: "Dev ops"
  source: "https://zapier.com/automations/engineering/dev-ops/environment-management/update-environment-usage-and-log-from-deploy-reaction"
---

# Update environment usage and log from deploy reaction

## What it does

1. **Trigger:** someone adds the deploy reaction (`:rocket:` by default) to a message in the chosen Slack channel.
2. **Filter (code):** the run continues only if the reaction is `DEPLOY_REACTION` and the message text contains `DEPLOY_MARKER` (`deploy`, case-insensitive). Otherwise it stops with nothing written.
3. **Extract (code):** the environment name is read from the text: `env: <name>` / `environment=<name>` first, otherwise the word after `to` (as in "Deployed to staging"). No match, no run.
4. **Slack** looks up the reacting user's name.
5. **Google Sheets** looks up the registry row whose environment column matches.
6. **Google Sheets** (if a row matched) sets status to `In use`, last-used to now, and last-used-by to the reacting user.
7. **Google Sheets** always appends a usage-log row: timestamp, environment, previous status, new status, who reacted, message link.
8. **Slack** replies in the original message's thread with what changed, or says no registry row was found.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Slack, New Reaction Added in a Channel (`slack`, `new_reaction_added_v3`), with the user's Slack connection as `authentication_id` and these params:
   - `conversation`: the channel ID to watch (resolve the channel name with the field's choices).
   - `emoji`: `rocket`, or whatever `DEPLOY_REACTION` is set to.
   - `message_detail`: `readable`. Required: without it the trigger doesn't fetch the message text.
2. **Connections** (each alias in the code is the app's slug):
   - `slack`: the user's Slack connection for the workspace with the deploy channel. The same connection posts the thread reply, as the Zapier bot.
   - `google-sheets`: the user's Google Sheets connection, for the account that owns the registry sheet.
3. **Constants:**
   - `DEPLOY_REACTION`: the emoji name without colons. Keep it equal to the trigger's `emoji`.
   - `DEPLOY_MARKER`: the text a deploy message must contain. Defaults to `"deploy"`.
   - `SPREADSHEET_ID`: the long ID in the sheet's URL.
   - `REGISTRY_WORKSHEET_ID`: the registry tab. The first tab is `"0"`.
   - `ENV_NAME_COLUMN`, `STATUS_COLUMN`, `LAST_USED_COLUMN`, `LAST_USED_BY_COLUMN`: registry column keys such as `COL$A`, not header names.
   - `IN_USE_STATUS`: the status to write. Defaults to `"In use"`.
   - `LOG_WORKSHEET_ID`: the log tab's ID (the number after `#gid=` in its URL).
   - `LOG_*_COLUMN`: the log tab's column keys for timestamp, environment, previous status, new status, reacted by, and message link.
   - `MENTION_REACTOR`: `false` by default. If `true`, the reply @-mentions the reacting user.
   - `ENV_PATTERNS`: change these only if the team's deploy messages name environments some other way.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user to react with the deploy emoji to try it.

## Ask the user

- Which Slack channel do deploy messages go to, and which emoji means "deployed"?
- How do their deploy messages name the environment? The default patterns handle `env: staging-2` and `Deployed to staging`.
- Which sheet and tab is the environment registry, and which columns hold the environment name, status, last-used time and last-used-by? Which tab is the usage log, and which columns does it have? If there's no log tab yet, offer to create one with the headers Timestamp, Environment, Previous Status, New Status, Reacted By, Message Link.
- Should the status read something other than `In use`?

## Test

Post a message such as `Deploy env: <an environment in the registry>` in the channel and note its `ts`. Then run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, with that `ts`, the channel ID and a real Slack user ID for `user`:

```json
{
  "conversation": "C0123456789",
  "reaction": "rocket",
  "reaction_count": 1,
  "user": "U0123456789",
  "event_ts": "1793318400.000100",
  "event_timestamp": "2026-10-30T00:00:00.000Z",
  "message": {
    "text": "Deploy env: staging-1",
    "raw_text": "Deploy env: staging-1",
    "ts": "1793318327.080679",
    "permalink": "https://example.slack.com/archives/C0123456789/p1793318327080679",
    "channel": { "id": "C0123456789", "name": "deploys" },
    "user": { "name": "Zapier", "is_bot": true }
  }
}
```

Confirm three things: the registry row for `staging-1` now reads `In use` with a last-used time and the user's name; the log tab has one new row with the previous status; and the message's thread has the bot's confirmation reply. Then tell the user to change the registry row back if it was real data.

## Customize

- **Restrict runs** to particular channels or tags to cut noise: set the trigger's channel, or add a channel or tag check next to the `DEPLOY_MARKER` filter.
- **Alert an owner when no row matches:** on the no-match path, send a Slack DM to the on-call or release owner.

## Notes

- Google Sheets may show the timestamps in the sheet's own format and time zone.
- If two registry rows share an environment name, only the first is updated.
- A reaction on a thread reply posts the confirmation in that same thread.
- The usage log gets a row even when no registry row matches. Its previous status then reads `(no registry row)`.
- Never commit a real spreadsheet ID.
