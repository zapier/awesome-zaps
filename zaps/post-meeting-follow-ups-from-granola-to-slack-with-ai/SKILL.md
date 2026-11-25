---
name: post-meeting-follow-ups-from-granola-to-slack-with-ai
description: Build a Zap on Zapier that checks the user's Granola notes every hour and, for each meeting they recorded, DMs them a recap of decisions and action items in Slack with a draft follow-up email to the other attendees. Use when someone records meetings in Granola and wants their follow-ups written for them before they move on to the next call.
license: MIT
metadata:
  author: zapier
  summary: "Within about an hour of each meeting you record in Granola, AI DMs you the decisions and action items in Slack, with a follow-up email ready to paste."
  apps: "Granola, Slack, AI by Zapier, Schedule by Zapier"
  category: "Personal Productivity"
  job: "Meeting management"
---

# Post meeting follow-ups from Granola to Slack with AI

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/post-meeting-follow-ups-from-granola-to-slack-with-ai. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** every hour at a quarter past, weekends included (`schedule`, `everyHour`).
2. **Granola** is read through its public API with the user's API key. The workflow lists the notes that changed in the last `WINDOW_MINUTES` (60) and were created in the last `LOOKBACK_HOURS` (4), so a note edited days later isn't posted again. Granola only returns a note once it has written the summary. When there's nothing new, the Zap stops there.
3. For each note, the workflow reads the summary, the user's own notes and the transcript, up to `MAX_TRANSCRIPT_CHARS` (60,000). It skips notes someone else recorded and shared with the user. The attendees come from the note, or from the calendar invite when Granola left them empty.
4. **AI by Zapier** writes two things. The recap lists up to five decisions and the action items that have an owner, with the user's own first. The follow-up email goes from the user to the other attendees in under 150 words, and comes back empty when nothing was agreed.
5. **Slack** posts each meeting as the bot: the title linked to the Granola note, the recap, and the draft email quoted underneath. A member ID gets a DM; anything else is treated as a channel.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                   | Where                            | What goes there                                                                                                                                                                                             |
| ------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_GRANOLA_API_KEY` | `GRANOLA_API_KEY` in `config.ts` | A personal API key from the Granola desktop app (Settings, Connectors, API keys) with the Personal notes scope. It needs Granola Business or Enterprise, and on Enterprise an admin can turn API access off |
| `REPLACE_MY_EMAIL`        | `MY_EMAIL` in `config.ts`        | The email on their Granola account, so only meetings they recorded get a follow-up                                                                                                                          |
| `REPLACE_SLACK_CHANNEL`   | `SLACK_CHANNEL` in `config.ts`   | Their own Slack member ID to get each follow-up as a DM, or a channel only they read. Look up the ID with their Slack connection                                                                            |

Ask the user to keep the key out of the chat if they can, for example by saving it to a file you read. Anyone who can read the workflow's source can read the key.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` to the user's Slack connection. `ai` uses AI by Zapier and needs no account of its own. Granola is read with the API key in `config.ts`, so no Granola connection is bound; Zapier's Granola app connection doesn't work with Granola's public API.
2. **Source:** publish `workflow.ts` and `config.ts`, with the `REPLACE_` values set to the user's answers. `triggers/every-hour.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the Slack `direct_message` and `channel_message` actions and the AI by Zapier `get_completion` action with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match. Granola has no action to inspect.

Draft and workflow tools return the source files in their responses, key included. Don't repeat those responses in the chat.

## Test it

Run a draft test (`run_workflow_draft` in Zapier MCP) with `SLACK_CHANNEL` set to the user's own member ID. For the test only, raise `WINDOW_MINUTES` and `LOOKBACK_HOURS` so they reach back past the user's last recorded meeting (300 and 6 cover a meeting five hours ago). The schedule trigger sends nothing the Zap reads, so any input works:

```json
{}
```

The run's output counts the notes it found and the follow-ups it posted. Zero notes means Granola has no summarized notes in that window. Confirm that each DM links to the right Granola note, that the action items match what was agreed, and that the email greets the people who were there. Then set `WINDOW_MINUTES` back to 60 and `LOOKBACK_HOURS` back to 4 before publishing. The user deletes the test DMs, not the agent.

## Notes

- A note that changes again later, while it's still within `LOOKBACK_HOURS` of being created, gets a second follow-up. Editing the note or regenerating its summary both count as changes.
- The follow-up email is a draft in Slack. Nothing is emailed.
- When a workspace admin has turned off transcript access over Granola's API, the AI works from the summary and the user's notes alone.
- A transcript longer than `MAX_TRANSCRIPT_CHARS` is cut from the end, so the last part of a long meeting may be missing from the recap.
- To skip weekends, set `weekends` to `"no"` in `triggers/every-hour.ts`. If the interval changes, change `WINDOW_MINUTES` to match.
- If the key is ever exposed, revoke it in Granola and make a new one.
