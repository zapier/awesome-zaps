---
name: post-meeting-notes-and-action-items-to-team
description: Build a Zapier Next Gen Zap that, when a new meeting notes file lands in a project folder in Google Drive, reads the transcript, records the meeting in a Zapier Table, and posts the action items to a team Slack channel. Use when a team keeps meeting notes in Google Drive and wants the action items shared automatically without copying them by hand.
metadata:
  author: zapier
  summary: "When new meeting notes appear in your project folder, the action items are pulled out, logged in a meeting table and posted to your team channel."
  apps: "Google Drive, Webhooks by Zapier, Zapier Tables, Slack"
  category: "Executives"
  job: "Meeting management"
  source: "https://zapier.com/automations/executives/meeting-management/meeting-notes-distribution/post-meeting-notes-and-action-items-to-team"
---

# Post meeting notes and action items to team

## What it does

1. **Trigger:** a new file appears in your project folder in Google Drive (New File in Folder).
2. **Formatter (in code):** the file's created date becomes a readable date, such as "October 20, 2026".
3. **Webhooks by Zapier** GETs the file's plain-text export and reads the transcript.
4. **Action items (in code):** the transcript is split after the "Suggested next steps" line, and each line starting with `- ` becomes one action item.
5. **Zapier Tables** creates a row in your meeting table: title, date, file link, and the action items.
6. **Slack** posts the title, date, link and action items as bullets to your team channel, with no @-mentions.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Drive, New File in Folder (`google-drive`, `file_in_folder_v2`). Point it at your project folder, and leave "Include Subfolders" off.
2. **Connections** (each alias in the code is the app's slug):
   - `google-drive`: the Google account that owns the project folder (trigger only; the code does not call Drive).
   - `zapier-tables`: your Zapier Tables account.
   - `slack`: the Slack account in your workspace that can post to the channel.
   - Webhooks by Zapier needs no connection.
3. **Constants:**
   - `SLACK_CHANNEL_ID`: the channel's ID (starts with `C`), not its name.
   - `MEETINGS_TABLE_ID`: the Zapier Table's ID. Create it first with the columns Meeting title, Meeting date, Meeting link (text) and Action items (long text).
   - `TRANSCRIPT_URL_TEMPLATE`: the Google Docs plain-text export URL. Leave it unless your notes are not Google Docs.
   - `ALLOW_MENTIONS`: `false` keeps Slack from notifying anyone. Set it to `true` only if you want mentions to notify people.
   - `ACTION_ITEMS_MARKER`: the heading that comes before the action items in your notes.
   - `MAX_ACTION_ITEMS`: the most items posted in one message.
4. Test with the sample below, then publish, confirm the trigger is active, and give the user the trigger's setup (the folder).

## Ask the user

- Which Drive folder holds the meeting notes?
- Which Slack channel should receive the summary? Use its ID.
- Which Zapier Table holds meetings, and does it have the four columns?
- Do the notes use the heading "Suggested next steps" with `- ` bullets? If not, tell us the heading and bullet style before installing.
- Are the notes shared so that the export link works (for example, "anyone with the link can view")? A private file will not export through a plain GET.

## Test

Run this sample as a draft test run (`run_workflow_draft`) before publishing. It stands in for the Drive trigger, so the input carries the file's details and a plain-text URL for the transcript (`text_url`). The URL below is a public test endpoint that returns the transcript text:

```json
{
  "title": "[install-test] Weekly launch sync",
  "created_at": "2026-10-20T16:00:00Z",
  "file_id": "install-test-file",
  "file_url": "https://docs.google.com/document/d/install-test-file",
  "text_url": "https://httpbin.org/base64/V2Vla2x5IGxhdW5jaCBzeW5jLiBXZSByZXZpZXdlZCB0aGUgbGF1bmNoIHRpbWluZyBhbmQgdGhlIGN1c3RvbWVyIGxpc3QuClN1Z2dlc3RlZCBuZXh0IHN0ZXBzCi0gUHJpeWE6IHNlbmQgdGhlIHJldmlzZWQgbGF1bmNoIHBsYW4gYnkgRnJpZGF5Ci0gU2FtOiBib29rIHRoZSBjdXN0b21lciByZXZpZXcgY2FsbAotIExlZTogdXBkYXRlIHRoZSByaXNrIGxvZw=="
}
```

Check that:

- The run completes, with the transcript step showing the three bullet lines.
- The Zapier Table has one new row for "[install-test] Weekly launch sync", with October 20, 2026, the file link, and three action items.
- The Slack message in the test channel shows the title, date, link, and three bullets, with no mentions.

Then delete the test row and the test message.

## Customize

- **Shorten the link:** add URL Shortener by Zapier to produce a compact link before posting.
- **Private follow-up:** send a direct message to the meeting owner instead of channel posts.

## Notes

- Zapier Tables has no find-or-create step in this zap, so the workflow always creates a row. Running the same notes twice adds two rows.
- Every `- ` line after the marker becomes an action item, up to `MAX_ACTION_ITEMS`. Notes without the marker post "No action items found."
- Check them against a real trigger run before publishing.
- Never commit a real folder ID, channel ID, or table ID into a shared copy of this template.
