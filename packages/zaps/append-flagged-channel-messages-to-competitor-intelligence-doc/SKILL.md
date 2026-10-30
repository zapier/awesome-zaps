---
name: append-flagged-channel-messages-to-competitor-intelligence-doc
description: Build a Zapier Next Gen Zap that watches one Slack channel and appends messages that mention competitors to a central Google Doc, with the time, author and a link to each message, skipping duplicates. Use when a team collects competitor news in a Slack channel and wants it kept in one searchable document without copying it by hand.
metadata:
  author: zapier
  summary: "When a message about a competitor is posted in your Slack channel, it's added to your competitor intelligence doc with the time, author and a link back, so nothing gets lost."
  apps: "Slack, Google Docs"
  category: "Executives"
  job: "Strategy planning"
  source: "https://zapier.com/automations/executives/strategy-planning/competitive-intelligence/append-flagged-channel-messages-to-competitor-intelligence-doc"
---

# Append flagged channel messages to competitor intelligence doc

## What it does

1. **Trigger:** a new message is posted to one Slack channel (Slack, New Message Posted to Channel).
2. **Filter:** the message text must contain one of the flag keywords (`competitor`, `competitive`, `pricing`, `launch`). Other messages stop the run.
3. **Google Docs** finds the intelligence document by title, and creates it if it doesn't exist.
4. **Duplicate check:** the document's text is read; if the message's timestamp and text are both already there, the run stops.
5. **Google Docs** appends one entry: the message time, author, Slack timestamp and permalink on a header line, then the message text.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below.

1. **Trigger:** Slack, New Message Posted to Channel (`slack`, `channel_message`), with `raw` set to `yes` and `listen_for_bots` set to `no`. It needs a Slack connection, which goes in the trigger's `authentication_id`.
2. **Connections** (each alias in the code is the app's slug):
   - `google-docs`: the Google account that owns the intelligence document.
3. **Constants:**
   - `WATCHED_CHANNEL`: the Slack channel ID to watch. This must match the channel in the trigger's `params.channel`.
   - `SLACK_WORKSPACE_URL`: the workspace URL, used to build permalinks.
   - `INTEL_DOC_TITLE`: the document title to look for.
   - `FLAG_KEYWORDS`: the words that make a message worth capturing.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user where it is.

## Ask the user

- Which Slack channel should be watched, and what is its ID?
- Which Google account owns the intelligence document, and what title does it have (or should it be created with the default title)?
- Which words should flag a message? The default list is `competitor`, `competitive`, `pricing`, `launch`.

## Test

Post a test message to a test channel, then run this as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing:

```json
{
  "text": "[install-test] competitor launched a new pricing tier for SMB teams",
  "ts": "1793317958.713389",
  "channel": "C02M7813E",
  "username": "install-test"
}
```

Check that:

- The run finishes, and the document gains one entry: a header line with the time, author, `ts` and permalink, then the message text.
- Running the same input again skips it with `reason: duplicate`, and the document does not gain a second entry.
- A message without a flag keyword is skipped with `reason: not-flagged`.

Then tell the user to delete the test entries from the document if they were real data.

## Customize

- **Only capture approved keywords or specific reactions:** change `FLAG_KEYWORDS`, or add a reaction-based trigger branch.
- **Create a project task for high-priority mentions:** add a step after the append that creates a task in the user's project tool.

## Notes

- The document's text is checked for the message's `ts` and text together. This is a text match, not a stored record, so editing a logged entry by hand can cause it to be captured again.
- The message text is appended as-is, and the append action also accepts HTML, so messages containing angle brackets may render differently in the doc.
- Google Docs times are in UTC.
- Never commit a real channel ID, document ID or workspace URL. Anyone who can post in the watched channel can add entries to the document.
