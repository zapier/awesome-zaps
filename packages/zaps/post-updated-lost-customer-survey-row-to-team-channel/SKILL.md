---
name: post-updated-lost-customer-survey-row-to-team-channel
description: Build a Zapier Next Gen Zap that posts a completed lost-customer survey row from a Google Sheets tracker into a team Slack channel, then marks the row as notified so it is announced once. Use when a team collects lost-customer survey responses in a sheet and wants stakeholders to see and triage each completed response in chat as it arrives or changes.
metadata:
  author: zapier
  summary: "When a lost-customer survey row is completed in your tracking sheet, a summary lands in your team channel with a link back to the row, so stakeholders can triage and assign follow-up right away."
  apps: "Google Sheets, Slack"
  category: "Customer Service & Success"
  job: "Customer experience management"
  source: "https://zapier.com/automations/customer-service-success/customer-experience-management/customer-feedback-management/post-updated-lost-customer-survey-row-to-team-channel"
---

# Post updated lost customer survey row to team channel

## What it does

1. **Trigger:** a Google Sheets "New or Updated Spreadsheet Row" event fires for a row in the tracker. The event carries the full row, so no extra lookup is needed.
2. **Filter (in code):** the run stops if the row's survey status is not `Completed`, or if the row is already marked `notified`.
3. **Slack** posts one bot message to the team channel: customer name and entry source as the header, satisfaction score, assigned owner, video link and comments as the body, and a link back to the row.
4. **Google Sheets** writes `notified` into the notified column of that row, so later edits to the row do not announce it again.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top of the file; everything else stays as written.

1. **Trigger:** Google Sheets, New or Updated Spreadsheet Row (`google-sheets`, `updated_row_notify_hook`). Its `authentication_id` is the user's Google Sheets connection. Set `params` to `{ "spreadsheet": "YOUR_SPREADSHEET_ID", "worksheet": "0" }`. Leave the trigger column empty so any change to the row fires it; the notified check handles repeats.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the Google Sheets connection for the account that owns the tracker.
   - `slack`: the Slack connection for the workspace that owns the channel.
3. **Constants:**
   - `SPREADSHEET_ID`: the long ID in the sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `SLACK_CHANNEL_ID`: the channel's ID (starts with `C`).
   - `CUSTOMER_NAME_COLUMN`, `SATISFACTION_COLUMN`, `OWNER_COLUMN`, `ENTRY_SOURCE_COLUMN`, `VIDEO_LINK_COLUMN`, `COMMENTS_COLUMN`, `SURVEY_STATUS_COLUMN`, `NOTIFIED_COLUMN`: column keys such as `COL$A`, not header names. Map the sheet's headers to their column letters.
   - `COMPLETED_STATUS`: the survey-status value that qualifies a row. Defaults to `"Completed"`.
   - `NOTIFIED_VALUE`: the value written to mark a row. Defaults to `"notified"`.
   - `MENTION_ASSIGNED_OWNER`: `false` by default. Set to `true` only if the owner column holds Slack handles.
   - `BOT_NAME`: the name shown above the message.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the trigger's details so they know which sheet it watches.

## Ask the user

- Which spreadsheet and tab is the tracker, and which columns hold the customer name, satisfaction score, assigned owner, entry source, video link, comments, survey status and notified marker?
- Which Slack channel should receive the posts?
- What value in the survey-status column means a completed response? (The default is `Completed`.)
- Should the owner be @mentioned? If yes, the owner column must hold Slack handles.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. It is the shape of a trigger payload for one completed row. Use a row in a test spreadsheet, and a test channel, not live data:

```json
{
  "id": 2,
  "row": 2,
  "COL$A": "[install-test] SUB-1001",
  "COL$B": "[install-test] Test Customer",
  "COL$C": "2",
  "COL$D": "Dana (test owner)",
  "COL$E": "Website survey",
  "COL$F": "https://example.com/[install-test]-video",
  "COL$G": "[install-test] Pricing was too high for our team size.",
  "COL$H": "Price",
  "COL$I": "Completed",
  "COL$J": ""
}
```

Check two things:

- **Post:** the channel gets one bot message with the customer, source, score, owner, video, comments and a link to row 2. The run output shows `markedRow: 2` and a message timestamp.
- **Mark:** row 2's notified column now reads `notified`, and no other cell changed.

Then run the same sample with `COL$J` set to `notified`. It should finish with `reason: "already-notified"` and post nothing. Delete the test row and test spreadsheet afterwards, or leave them clearly labelled.

## Customize

- **Send a DM to the assigned owner** instead of the channel for private follow-up.
- **Create a ticket** in your issue tracker for high-severity feedback (for example, a satisfaction score at or below a threshold).

## Notes

- The run marks rows by writing to the notified column, not by matching the submission ID. If two rows share a submission ID, both will post.
- The sheet write-back fires the trigger again. The notified check makes that second run a harmless skip.
- Never commit a real spreadsheet ID or channel ID. The `workflow.ts` here uses placeholders.
