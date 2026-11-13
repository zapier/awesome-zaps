---
name: update-environment-usage-and-log-from-deploy-reaction
description: Build a Zap on Zapier that, when someone adds a deploy reaction (such as :rocket:) to a Slack message naming an environment, marks that environment in use in a Google Sheets registry, appends a timestamped row to a usage log tab, and replies in the message's thread. Use when an engineering or dev ops team tracks shared environments (staging, QA, preview) in a sheet and claims them from Slack.
license: MIT
metadata:
  author: zapier
  summary: "React with a rocket to a deploy message in Slack and the environment it names is marked in use in your registry sheet, logged with a timestamp, and confirmed in the thread."
  apps: "Slack, Google Sheets"
  category: "Engineering"
  job: "Dev ops"
  source: "https://zapier.com/automations/engineering/dev-ops/environment-management/update-environment-usage-and-log-from-deploy-reaction"
---

# Update environment usage and log from deploy reaction

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-environment-usage-and-log-from-deploy-reaction. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** someone adds the deploy reaction (`rocket` by default) to a message in the chosen channel (`slack`, `new_reaction_added_v3`). The trigger brings the message text.
2. **Filter:** the run continues only if the reaction matches `DEPLOY_REACTION` and the message text contains `DEPLOY_MARKER` (`deploy`, case-insensitive). Otherwise it stops with nothing written.
3. **Extract:** the environment name is read from the text: `env: <name>` or `environment=<name>` first, otherwise the word after `to` (as in "Deployed to staging"). No match, no run.
4. **Slack** looks up the reacting user's name.
5. **Google Sheets** looks up the registry row whose environment column matches.
6. **Google Sheets** sets that row's status to `In use`, last-used to now, and last-used-by to the reacting user, if a row matched.
7. **Google Sheets** always appends a usage-log row: timestamp, environment, previous status, new status, who reacted, message link.
8. **Slack** replies in the original message's thread with what changed, or says no registry row was found.

The Zap only marks environments in use and writes to the log. It never releases an environment.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                     | Where                                            | What goes there                                                                                                                                                                                     |
| --------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_DEPLOY_CHANNEL_ID` | `triggers/new-reaction-added.ts`, `conversation` | The Slack channel where deploy messages go. The thread reply posts there too                                                                                                                        |
| `REPLACE_SPREADSHEET_ID`    | `config.ts`                                      | The Google Sheet that holds the environment registry and the usage log                                                                                                                              |
| `REPLACE_LOG_WORKSHEET_ID`  | `config.ts`                                      | The usage-log tab in that sheet. Its columns are timestamp, environment, previous status, new status, reacted by, message link. If the tab doesn't exist yet, offer to create it with those headers |

Also review the defaults with them: `DEPLOY_REACTION` (`rocket`, must match the trigger's `emoji`), `DEPLOY_MARKER` (`deploy`), `IN_USE_STATUS` (`In use`), the registry columns (`ENV_NAME_COLUMN`, `STATUS_COLUMN`, `LAST_USED_COLUMN`, `LAST_USED_BY_COLUMN`, which default to columns A to D), `REGISTRY_WORKSHEET_ID` (`"0"` is the first tab), `MENTION_REACTOR` (`false`) and `ENV_PATTERNS` in `workflow.ts`. Also ask how their deploy messages name the environment: the default patterns handle `env: staging-2` and `Deployed to staging`.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` to the user's Slack connection for the workspace with the deploy channel. The trigger and the thread reply use the same one, which posts as the Zapier bot. Bind `google-sheets` to the user's Google Sheets connection for the account that owns the registry sheet.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-reaction-added.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Post a message such as `Deploy env: <an environment in the registry>` in a channel the user controls, and note its `ts`. Then run this sample as a draft test, with that `ts`, the channel ID and the user's own Slack user ID for `user`:

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

Confirm three things: the registry row for `staging-1` now reads `In use` with a last-used time and the user's name; the log tab has one new row with the previous status; and the message's thread has the bot's confirmation reply. If run-status tools aren't available, check the result in Google Sheets and Slack directly. Ask the user to delete the test rows and restore any registry row that held real data. Then publish, confirm the trigger is active, and ask the user to react with the deploy emoji once to try it.

## Notes

- Restrict runs to particular channels or tags to cut noise: set the trigger's channel, or add a channel or tag check next to the `DEPLOY_MARKER` filter.
- To alert an owner when no row matches, send a Slack DM to the on-call or release owner on the no-match path.
- Google Sheets may show the timestamps in the sheet's own format and time zone.
- If two registry rows share an environment name, only the first is updated.
- A reaction on a thread reply posts the confirmation in that same thread.
- The usage log gets a row even when no registry row matches; its previous status then reads `(no registry row)`.
- Never commit a real spreadsheet ID.
