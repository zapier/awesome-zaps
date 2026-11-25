---
name: post-a-morning-meeting-brief-from-granola-to-slack-with-ai
description: Build a Zap on Zapier that reads the user's Google Calendar each weekday morning, finds their past Granola notes with the people in each meeting, and DMs them one Slack message with a short brief per meeting. Use when someone records meetings in Granola and wants to walk into each call knowing where they left off with those people.
license: MIT
metadata:
  author: zapier
  summary: "Every weekday morning, AI reads your past Granola notes with the people on today's calendar and DMs you in Slack where you left off with each of them."
  apps: "Google Calendar, Granola, Slack, AI by Zapier, Schedule by Zapier"
  category: "Personal Productivity"
  job: "Meeting management"
---

# Post a morning meeting brief from Granola to Slack with AI

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/post-a-morning-meeting-brief-from-granola-to-slack-with-ai. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** every weekday at 7:30 AM in the account's timezone (`schedule`, `everyDay`).
2. **Google Calendar** is read for the meetings on the user's primary calendar that start in the next `HOURS_AHEAD` (14) hours. The workflow leaves out cancelled and all-day events, focus time and out-of-office blocks, meetings the user declined, titles with any of `SKIP_WORDS`, and meetings with no other guests or more than `MAX_GUESTS` (8). When nothing is left, the Zap stops there.
3. **Granola** is read through its public API with the user's API key. For each meeting, the workflow searches for notes from the last `LOOKBACK_DAYS` (90) with each guest on the calendar invite, then reads the summary and the user's own notes from the `NOTES_PER_MEETING` (3) most recent.
4. **AI by Zapier** writes a brief for each meeting under _Where you left off_, _Open items_ and _Worth raising_. When the past meetings have nothing to do with today's, it returns nothing for that one.
5. **Slack** posts one message as the bot, with a brief per meeting in time order and one line at the end naming the meetings it had nothing for. When no meeting got a brief, nothing is posted.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                   | Where                            | What goes there                                                                                                                                                                                             |
| ------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_GRANOLA_API_KEY` | `GRANOLA_API_KEY` in `config.ts` | A personal API key from the Granola desktop app (Settings, Connectors, API keys) with the Personal notes scope. It needs Granola Business or Enterprise, and on Enterprise an admin can turn API access off |
| `REPLACE_MY_EMAIL`        | `MY_EMAIL` in `config.ts`        | The email on their Google Calendar, so they aren't counted as a guest of their own meetings                                                                                                                 |
| `REPLACE_SLACK_CHANNEL`   | `SLACK_CHANNEL` in `config.ts`   | Their own Slack member ID to get the brief as a DM, or a channel only they read. Look up the ID with their Slack connection                                                                                 |

Also ask when they start their day, and set `hod` in `triggers/every-weekday-morning.ts` to before their first meeting. Ask the user to keep the key out of the chat if they can, for example by saving it to a file you read. Anyone who can read the workflow's source can read the key.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-calendar` to the user's Google Calendar connection and `slack` to their Slack connection. `ai` uses AI by Zapier and needs no account of its own. Granola is read with the API key in `config.ts`, so no Granola connection is bound; Zapier's Granola app connection doesn't work with Granola's public API.
2. **Source:** publish `workflow.ts` and `config.ts`, with the `REPLACE_` values set to the user's answers. `triggers/every-weekday-morning.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the Slack `direct_message` and `channel_message` actions and the AI by Zapier `get_completion` action with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match. Google Calendar is read through its API with the `google-calendar` connection and Granola with the key, so neither has an action to inspect.

Draft and workflow tools return the source files in their responses, key included. Don't repeat those responses in the chat.

## Test it

Run a draft test (`run_workflow_draft` in Zapier MCP) with `SLACK_CHANNEL` set to the user's own member ID, at a time when meetings with guests are still ahead. If the rest of the day is empty, raise `HOURS_AHEAD` for the test so the next workday's meetings count. The schedule trigger sends nothing the Zap reads, so any input works:

```json
{}
```

The run's output counts the meetings it found and the ones it briefed. Confirm that each _Where you left off_ matches the user's last meeting with those people and that the open items are real. Then set `HOURS_AHEAD` back to 14 before publishing. The user deletes the test DM, not the agent.

## Notes

- Granola finds past meetings by who was on the calendar invite, so a call that had no invite won't show up.
- The brief reads summaries and the user's own notes. It doesn't read transcripts.
- Start times show in the calendar's own timezone.
- The brief copies meeting details into Slack. Send it to a DM or a channel only the user can read.
- If the key is ever exposed, revoke it in Granola and make a new one.
