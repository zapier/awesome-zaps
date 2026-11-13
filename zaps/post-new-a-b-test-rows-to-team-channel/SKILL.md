---
name: post-new-a-b-test-rows-to-team-channel
description: Build a Zap on Zapier that posts each new A/B test row from a Google Sheets log to a Slack channel, with the variants, test URL, reporter and screenshot, and skips rows whose test URL was already posted. Use when a design, product or growth team logs A/B or user tests in a sheet and wants stakeholders told in Slack as soon as one is added.
license: MIT
metadata:
  author: zapier
  summary: "When someone adds an A/B test to your tracking sheet, its variants, link, reporter and screenshot are posted to your team's Slack channel so everyone can review it right away."
  apps: "Google Sheets, Slack"
  category: "Design"
  job: "User testing"
  source: "https://zapier.com/automations/design/user-testing/a-b-test-management/post-new-a-b-test-rows-to-team-channel"
---

# Post new A/B test rows to team channel

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/post-new-a-b-test-rows-to-team-channel. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new row is added to the bottom of the A/B test worksheet in Google Sheets (`google-sheets`, `new_row_notify_hook`).
2. If the row has no test name, variants or URL, the run stops (blank row).
3. **Google Sheets** looks up every row with the same test URL. If an earlier row already has that URL, the run stops so the same test isn't posted twice.
4. **Slack** posts one message to the team channel: an `@channel` mention, the test name, Variant A, Variant B, the test URL as a link, who reported it, and the screenshot. When the row has a screenshot URL the image is attached; otherwise the message says none is attached yet.

The Zap only reads the sheet and posts to Slack. It never edits a row, and a skipped run posts nothing.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting            | What goes there                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `SPREADSHEET_ID`   | The A/B test log spreadsheet: the long ID in its URL. The trigger uses the same spreadsheet and worksheet. |
| `SLACK_CHANNEL_ID` | The channel that gets the posts, as its ID (starts with `C`)                                               |

Also review the defaults with them: `WORKSHEET_ID` (`"0"` is the first tab; the worksheet needs a header row), the six column settings (`TEST_NAME_COLUMN` to `SCREENSHOT_COLUMN`; the defaults assume columns A to F hold test name, Variant A, Variant B, test URL, reporter and screenshot URL), and `MENTION_CHANNEL` in `workflow.ts`, which prefixes each post with `@channel`.

Ask them:

- Which spreadsheet and tab is the A/B test log, and which columns hold the test name, the two variants, the test URL, the reporter and the screenshot link? If they have no log yet, offer to create one with those six headers.
- Should posts `@channel` everyone, or post quietly?

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` (the account that owns the test log) and `slack` (the workspace with the team channel) to the user's connections. The trigger and the actions use them. Every app here needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-row-notify-hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's `spreadsheet` and `worksheet` params from `SPREADSHEET_ID` and `WORKSHEET_ID`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Add a row to a test sheet the user controls (or use one they just added), then run it as a draft test run (`run_workflow_draft` in Zapier MCP) with the trigger's record as input. Sample input:

```json
{
  "id": 2,
  "row": 2,
  "COL$A": "[install-test] Checkout button color",
  "COL$B": "Green button, 'Buy now'",
  "COL$C": "Orange button, 'Complete purchase'",
  "COL$D": "https://example.com/checkout?exp=install-test-1",
  "COL$E": "Sample Reporter"
}
```

Empty cells are left out of the trigger record, as `COL$F` is here. Check that:

- one message appears in the channel with the `@channel` mention, both variants, an "Open the test" link, the reporter and the "none attached yet" screenshot line;
- a row that adds a screenshot URL in `COL$F` posts with the image attached;
- a later row with the same test URL returns `{ skipped: true, reason: "duplicate-url" }` and posts nothing.

If run-status tools aren't available, check the result in Slack directly. Publish after the checks pass, and wait until the trigger reads back as active. The user deletes the test rows and messages, not the agent.

## Notes

- The trigger fires only for rows added at the bottom of the sheet; editing an existing row doesn't post again.
- The duplicate check reads up to 50 rows with the same URL and compares the text exactly, so `https://example.com/a` and `https://example.com/a/` count as different tests. A row with no URL is always posted.
- Slack attaches the screenshot only if its URL is publicly reachable; a link behind a login shows only as the "View screenshot" link.
- Google Sheets drops a leading `'` in a cell.
- To DM the test owner instead of mentioning the channel, look up the reporter in Slack and send a direct message. To create a task for long reviews instead of posting, add a step that creates it in the user's project tool.
- Never commit a real spreadsheet ID or channel ID.
