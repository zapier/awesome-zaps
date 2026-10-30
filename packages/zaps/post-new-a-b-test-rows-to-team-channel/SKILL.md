---
name: post-new-a-b-test-rows-to-team-channel
description: Build a Zapier Next Gen Zap that posts each new A/B test row from a Google Sheets log to a Slack channel, with the variants, test URL, reporter and screenshot, and skips rows whose test URL was already posted. Use when a design, product or growth team logs A/B or user tests in a sheet and wants stakeholders told in Slack as soon as one is added.
metadata:
  author: zapier
  summary: "When someone adds an A/B test to your tracking sheet, its variants, link, reporter and screenshot are posted to your team's Slack channel so everyone can review it right away."
  apps: "Google Sheets, Slack"
  category: "Design"
  job: "User testing"
  source: "https://zapier.com/automations/design/user-testing/a-b-test-management/post-new-a-b-test-rows-to-team-channel"
---

# Post new A/B test rows to team channel

## What it does

1. **Trigger:** a new row is added to the bottom of the A/B test worksheet in Google Sheets.
2. If the row has no test name, variants or URL, the run stops (blank row).
3. **Google Sheets** looks up every row with the same test URL. If an earlier row already has that URL, the run stops so the same test isn't posted twice.
4. **Slack** posts one message to the team channel: an `@channel` mention, the test name, Variant A, Variant B, the test URL as a link, who reported it, and the screenshot. When the row has a screenshot URL the image is attached; otherwise the message says none is attached yet.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Sheets, New Spreadsheet Row (`google-sheets`, `new_row_notify_hook`), with params `spreadsheet` (same as `SPREADSHEET_ID`) and `worksheet` (same as `WORKSHEET_ID`). Its `authentication_id` is the user's Google Sheets connection. The worksheet must have a header row.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the user's Google Sheets connection, for the account that owns the test log.
   - `slack`: the user's Slack connection, for the workspace with the team channel.
3. **Constants:**
   - `SPREADSHEET_ID`: the long ID in the sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `TEST_NAME_COLUMN`, `VARIANT_A_COLUMN`, `VARIANT_B_COLUMN`, `TEST_URL_COLUMN`, `REPORTER_COLUMN`, `SCREENSHOT_COLUMN`: column keys such as `COL$A`, not header names. Defaults assume columns A–F in that order: Test Name, Variant A, Variant B, Test URL, Reporter, Screenshot URL.
   - `SLACK_CHANNEL_ID`: the channel's ID (such as `C0123456789`), resolved from the channel name with the Slack action's channel choices.
   - `MENTION_CHANNEL`: `true` prefixes the post with `@channel`. Set `false` for a quieter post.
4. Test with the steps below, then publish, and wait until the trigger reads back as active.

## Ask the user

- Which spreadsheet and tab is the A/B test log, and which columns hold the test name, the two variants, the test URL, the reporter and the screenshot link? If they have no log yet, offer to create one with those six headers.
- Which Slack channel should the posts go to?
- Should posts `@channel` everyone (the spec's default) or post quietly?

## Test

Add a row to the user's sheet (or use one they just added), then run it as a draft test run (`run_workflow_draft` in Zapier MCP) with the trigger's record as input. The sample used when this was built:

```json
{
  "id": 2,
  "row": 2,
  "COL$A": "[install-test] Checkout button color",
  "COL$B": "Green button, 'Buy now'",
  "COL$C": "Orange button, 'Complete purchase'",
  "COL$D": "https://example.com/checkout?exp=install-test-1",
  "COL$E": "Andrew K"
}
```

Empty cells are left out of the trigger record, as `COL$F` is here. Check that:

- one message appears in the channel with the `@channel` mention, both variants, an "Open the test" link, the reporter and the "none attached yet" screenshot line;
- a row that adds a screenshot URL in `COL$F` posts with the image attached;
- a later row with the same test URL returns `{ skipped: true, reason: "duplicate-url" }` and posts nothing.

Tell the user to delete the test rows and messages if they were added to real data.

## Customize

- **DM the test owner** instead of mentioning the whole channel: look up the reporter in Slack and send a direct message.
- **Create a task for long reviews** in the user's project tool instead of posting.

## Notes

- The trigger fires only for rows added at the bottom of the sheet; editing an existing row doesn't post again.
- The duplicate check looks at up to 50 rows with the same URL and compares exact text, so `https://example.com/a` and `https://example.com/a/` count as different tests. A row with no URL is always posted.
- Slack needs the screenshot URL to be publicly reachable to attach it; links behind a login show only as the "View screenshot" link.
- Google Sheets treats a leading `'` in a cell as a text marker and drops it.
- Never commit a real spreadsheet ID or channel ID.
