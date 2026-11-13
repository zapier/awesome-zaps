---
name: create-end-to-end-test-scripts-from-sheet-user-stories
description: Build a Zap on Zapier that reads a changed user story row in a Google Sheet, asks ChatGPT for structured test cases and a runnable TypeScript end-to-end test script, and writes both back to an output tab for QA review. Use when a QA or product team keeps user stories in a sheet and wants test cases and scripts generated for each story without copy and paste.
license: MIT
metadata:
  author: zapier
  summary: "When a user story in your sheet is added or changed, its test cases and an end-to-end test script are generated and saved to a review tab, so QA can pick them up."
  apps: "Google Sheets, ChatGPT (OpenAI)"
  category: "Engineering"
  job: "Quality assurance"
  source: "https://zapier.com/automations/engineering/quality-assurance/end-to-end-testing/create-end-to-end-test-scripts-from-sheet-user-stories"
---

# Create end to end test scripts from sheet user stories

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-end-to-end-test-scripts-from-sheet-user-stories. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a story row is updated in the stories worksheet (`google-sheets`, `updated_row_only`).
2. **`chatgpt`** writes structured test cases for the story: Test ID, Test Case Name, Purpose, Preconditions and steps.
3. The workflow pulls the Test IDs, names and blocks out of that text, in plain code.
4. **`chatgpt`** writes a runnable TypeScript end-to-end test script from those blocks.
5. **`google-sheets`** looks up the output row whose Story ID matches. It updates that row if found, otherwise adds a new one, with Story ID, Test IDs, a test case summary and the script.

The prompts send the story text to ChatGPT, so use only stories you are allowed to send to it.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting               | What goes there                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `SPREADSHEET_ID`      | The spreadsheet that holds the user stories and the output tab; look up its ID from the sheet the user names              |
| `OUTPUT_WORKSHEET_ID` | The tab that receives the generated test cases and scripts; look up its ID (gid) from the spreadsheet in `SPREADSHEET_ID` |

Also review the defaults with them: `STORIES_WORKSHEET_ID` (`"0"` is the first tab, and the trigger's worksheet), `STORY_ID_COLUMN` and `STORY_DESCRIPTION_COLUMN` (the stories columns, such as `COL$A`), `OUTPUT_ID_COLUMN`, `OUTPUT_TEST_IDS_COLUMN`, `OUTPUT_SUMMARY_COLUMN` and `OUTPUT_SCRIPT_COLUMN` (the output columns; the output tab needs headers in these), and `CHATGPT_MODEL` (`gpt-3.5-turbo-instruct`).

Confirm the user may send these stories to ChatGPT before turning the Zap on.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `chatgpt` (the user's ChatGPT (OpenAI) connection, used for both prompts) and `google-sheets` (the account that owns the spreadsheet, used for the stories trigger and the output tab) to the user's connections. Connect ChatGPT before the first run.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-row-only.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. Set the trigger's `spreadsheet` and `worksheet` to `SPREADSHEET_ID` and `STORIES_WORKSHEET_ID`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run (`run_workflow_draft`) before publishing. Use a test row on the stories tab, not real data.

```json
{
  "COL$A": "US-101",
  "COL$B": "As a shopper, I can add an item to my cart and see the updated total."
}
```

Confirm that the output tab gets one row for `US-101`, with Test IDs such as `TC-001`, a summary, and a script that begins with TypeScript code. Run it twice to check that the second run updates the same row rather than adding one. If run-status tools aren't available, check the result in Google Sheets directly. Then publish, confirm the trigger is active, and ask the user to delete the test rows; the agent doesn't delete them.

## Notes

- Test IDs are read from `Test ID:` lines, and names from `Test Case Name:` lines. If the model does not follow that format, the run stops without writing anything.
- The trigger fires on any update to a story row, so editing a row again re-generates its outputs.
- To route the outputs to a reviewer by email or a review column before the output row is final, or to post the scripts to a code storage endpoint or pull request system, add a step after the test script.
- Never commit a real spreadsheet ID or worksheet ID to a public repo.
