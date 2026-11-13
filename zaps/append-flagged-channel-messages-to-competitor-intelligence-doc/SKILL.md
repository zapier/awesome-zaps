---
name: append-flagged-channel-messages-to-competitor-intelligence-doc
description: Build a Zap on Zapier that watches one Slack channel and appends messages that mention competitors to a central Google Doc, with the time, author and a link to each message, skipping duplicates. Use when a team collects competitor news in a Slack channel and wants it kept in one searchable document without copying it by hand.
license: MIT
metadata:
  author: zapier
  summary: "When a message about a competitor is posted in your Slack channel, it's added to your competitor intelligence doc with the time, author and a link back, so nothing gets lost."
  apps: "Slack, Google Docs"
  category: "Executives"
  job: "Strategy planning"
  source: "https://zapier.com/automations/executives/strategy-planning/competitive-intelligence/append-flagged-channel-messages-to-competitor-intelligence-doc"
---

# Append flagged channel messages to competitor intelligence doc

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/append-flagged-channel-messages-to-competitor-intelligence-doc. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new message is posted to the watched Slack channel (`slack`, `channel_message`).
2. **Filter:** the message text must contain one of the flag keywords (`competitor`, `competitive`, `pricing`, `launch`). Other messages stop the run.
3. **Google Docs** finds the intelligence document by title, and creates it if it doesn't exist.
4. **Duplicate check:** the document's text is read; if the message's timestamp and text are both already there, the run stops.
5. **Google Docs** appends one entry: the message time, author, Slack timestamp and permalink on a header line, then the message text.

The Zap only appends. It never edits or deletes what is already in the document.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve channel names to IDs with the user's Slack connection; don't ask them to paste an ID you can look up.

| Setting                       | Where                                                                        | What goes there                                   |
| ----------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------- |
| `REPLACE_WATCHED_CHANNEL`     | `triggers/channel-message.ts`, `channel`; and `config.ts`, `WATCHED_CHANNEL` | The Slack channel whose messages get captured     |
| `REPLACE_SLACK_WORKSPACE_URL` | `config.ts`, `SLACK_WORKSPACE_URL`                                           | The workspace address, `https://<name>.slack.com` |

The two `REPLACE_WATCHED_CHANNEL` values must be the same channel, which is why they share a name.

Also review the defaults with them: `INTEL_DOC_TITLE` in `config.ts` (the document title to look for; a new document with that title is created if none exists) and `FLAG_KEYWORDS` in `workflow.ts` (the words that flag a message; the default is `competitor`, `competitive`, `pricing`, `launch`).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-docs` to the Google account that owns the intelligence document, and `slack` to the user's Slack connection for the workspace with the watched channel. The trigger uses `slack`. Apps that need no connection: none.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/channel-message.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's `params` (`channel`, `raw`, `listen_for_bots`) from the trigger file. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test (`run_workflow_draft`), with the watched channel set to one the user controls, before publishing:

```json
{
  "text": "[install-test] competitor launched a new pricing tier for SMB teams",
  "ts": "1793317958.713389",
  "channel": "C0123456789",
  "username": "install-test"
}
```

Check that:

- The run finishes, and the document gains one entry: a header line with the time, author, `ts` and permalink, then the message text.
- Running the same input again skips it with `reason: duplicate`, and the document does not gain a second entry.
- A message without a flag keyword is skipped with `reason: not-flagged`.

If run-status tools aren't available, check the result in Google Docs directly. The user deletes the test entries, not the agent. Then publish, confirm the trigger is active, and tell the user where it is.

## Notes

- The duplicate check is a text match on the message's `ts` and text, not a stored record. Editing a logged entry by hand can cause it to be captured again.
- The message text is appended as-is, and the append action also accepts HTML, so messages with angle brackets may render differently in the doc.
- Google Docs times are in UTC.
- Anyone who can post in the watched channel can add entries to the document.
- To capture different words, change `FLAG_KEYWORDS`. To create a project task for high-priority mentions, add a step after the append that creates it in the user's project tool.
- Keep real channel IDs, document IDs and workspace URLs out of commits.
