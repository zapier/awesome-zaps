---
name: post-meeting-notes-and-action-items-to-team
description: Build a Zap on Zapier that, when a new meeting notes file lands in a project folder in Google Drive, reads the transcript, records the meeting in a Zapier Table, and posts the action items to a team Slack channel. Use when a team keeps meeting notes in Google Drive and wants the action items shared automatically without copying them by hand.
license: MIT
metadata:
  author: zapier
  summary: "When new meeting notes appear in your project folder, the action items are pulled out, logged in a meeting table and posted to your team channel."
  apps: "Google Drive, Webhooks by Zapier, Zapier Tables, Slack"
  category: "Executives"
  job: "Meeting management"
  source: "https://zapier.com/automations/executives/meeting-management/meeting-notes-distribution/post-meeting-notes-and-action-items-to-team"
---

# Post meeting notes and action items to team

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/post-meeting-notes-and-action-items-to-team. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new file appears in your project folder in Google Drive (`google-drive`, `file_in_folder_v2`).
2. **Code:** the file's created date becomes a readable date, such as "October 20, 2026".
3. **Webhooks by Zapier** GETs the file's plain-text export and reads the transcript.
4. **Code:** the transcript is split after the "Suggested next steps" line, and each line starting with `- ` becomes one action item.
5. **Zapier Tables** creates a row in your meeting table: title, date, file link, and the action items.
6. **Slack** posts the title, date, link and action items as bullets to your team channel.

The workflow never @-mentions anyone unless `ALLOW_MENTIONS` is set to `true`.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve channel names and table names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting             | What goes there                                                               |
| ------------------- | ----------------------------------------------------------------------------- |
| `SLACK_CHANNEL_ID`  | The Slack channel that gets the summary, by ID (starts with `C`), not name    |
| `MEETINGS_TABLE_ID` | The Zapier Table with one row per meeting, with the four columns listed below |

The table needs these columns: Meeting title, Meeting date, Meeting link (text) and Action items (long text).

Also review the defaults with them: `ACTION_ITEMS_MARKER` (`"Suggested next steps"`, the heading before the action items in the notes), `ALLOW_MENTIONS` (`false`, so Slack doesn't notify anyone), `MAX_ACTION_ITEMS` (`20`) and `TRANSCRIPT_URL_TEMPLATE` (the Google Docs plain-text export; leave it unless the notes are not Google Docs).

Before installing, confirm:

- Which Drive folder holds the meeting notes? The trigger watches it, with "Include Subfolders" off.
- Do the notes use the heading "Suggested next steps" with `- ` bullets? If not, tell us the heading and bullet style before installing.
- Are the notes shared so the export link works (for example, "anyone with the link can view")? A private file will not export through a plain GET.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-drive` (the Google account that owns the project folder; the trigger only), `zapier-tables` (the user's Zapier Tables account) and `slack` (the Slack account that can post to the channel) to the user's connections. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/file-in-folder.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's folder to the one the user named. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run before publishing. It stands in for the Drive trigger, so the input carries the file's details and a plain-text URL for the transcript (`text_url`). The URL below is a public test endpoint that returns the transcript text:

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

If run-status tools aren't available, check the result in Zapier Tables and the Slack channel directly. Ask the user to delete the test row and the test message; the agent doesn't delete them. Then publish and confirm the trigger is active.

## Notes

- Zapier Tables has no find-or-create step in this zap, so the workflow always creates a row. Running the same notes twice adds two rows.
- Every `- ` line after the marker becomes an action item, up to `MAX_ACTION_ITEMS`. Notes without the marker post "No action items found."
- To shorten the link, add URL Shortener by Zapier before the Slack step. To send a direct message to the meeting owner instead of channel posts, change the Slack step.
- Check the Zap against a real trigger run before publishing. Keep real folder, channel and table IDs out of any shared copy.
