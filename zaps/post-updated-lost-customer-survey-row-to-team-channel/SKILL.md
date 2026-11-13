---
name: post-updated-lost-customer-survey-row-to-team-channel
description: Build a Zap on Zapier that posts a completed lost-customer survey row from a Google Sheets tracker into a team Slack channel, then marks the row as notified so it is announced once. Use when a team collects lost-customer survey responses in a sheet and wants stakeholders to see and triage each completed response in chat as it arrives or changes.
license: MIT
metadata:
  author: zapier
  summary: "When a lost-customer survey row is completed in your tracking sheet, a summary lands in your team channel with a link back to the row, so stakeholders can triage and assign follow-up right away."
  apps: "Google Sheets, Slack"
  category: "Customer Service & Success"
  job: "Customer experience management"
  source: "https://zapier.com/automations/customer-service-success/customer-experience-management/customer-feedback-management/post-updated-lost-customer-survey-row-to-team-channel"
---

# Post updated lost customer survey row to team channel

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/post-updated-lost-customer-survey-row-to-team-channel. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Google Sheets "New or Updated Spreadsheet Row" event fires for a row in the tracker (`google-sheets`, `updated_row_notify_hook`). The event carries the full row, so no extra lookup is needed.
2. **Filter (in code):** the run stops if the row's survey status is not `Completed`, or if the row is already marked `notified`.
3. **Slack** posts one bot message to the team channel: customer name and entry source as the header, satisfaction score, assigned owner, video link and comments as the body, and a link back to the row.
4. **Google Sheets** writes `notified` into the notified column of that row, so later edits to the row do not announce it again.

The Zap only writes the notified marker back to the row. It never changes the survey answers.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                    | Where                                                                          | What goes there                                                                     |
| -------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `REPLACE_SPREADSHEET_ID`   | `config.ts`, and `params.spreadsheet` in `triggers/updated-row-notify-hook.ts` | The tracker spreadsheet, looked up by name with the user's Google Sheets connection |
| `REPLACE_SLACK_CHANNEL_ID` | `config.ts`                                                                    | The channel that gets the posts. Use the channel the team reads                     |

Both files take the same spreadsheet answer. Also review the defaults with the user: the column keys in `config.ts` (`CUSTOMER_NAME_COLUMN` through `NOTIFIED_COLUMN`, such as `COL$A` for column A) must match the sheet's headers; `WORKSHEET_ID` is the tab (`"0"` is the first tab); `COMPLETED_STATUS` (`"Completed"`) and `NOTIFIED_VALUE` (`"notified"`) must match what the sheet holds; `BOT_NAME` is the name shown above the message; and `MENTION_ASSIGNED_OWNER` in `workflow.ts` is `false`.

Ask the user: should the assigned owner be @mentioned? If yes, the owner column must hold Slack handles, and `MENTION_ASSIGNED_OWNER` becomes `true`.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` (the account that owns the tracker) and `slack` (the workspace that owns the channel) to the user's connections.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-row-notify-hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run before publishing. It is the shape of a trigger payload for one completed row. Use a row in a test spreadsheet and a test channel, not live data:

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

Then run the same sample with `COL$J` set to `notified`. It should finish with `reason: "already-notified"` and post nothing.

If run-status tools aren't available, check the result in Slack and Google Sheets directly. Ask the user to delete the test row, test spreadsheet and test messages, not the agent. Then publish, confirm the trigger is active, and tell the user which sheet it watches.

## Notes

- The run marks rows by writing to the notified column, not by matching the submission ID. If two rows share a submission ID, both will post.
- The sheet write-back fires the trigger again. The notified check makes that second run a harmless skip.
- Never commit a real spreadsheet ID or channel ID. `workflow.ts` and `config.ts` here use placeholders.
- To DM the assigned owner instead of the channel, or to open a ticket for low satisfaction scores, add a step after the mark.
