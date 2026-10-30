---
name: create-end-to-end-test-scripts-from-sheet-user-stories
description: Build a Zapier Next Gen Zap that reads a changed user story row in a Google Sheet, asks ChatGPT for structured test cases and a runnable TypeScript end-to-end test script, and writes both back to an output tab for QA review. Use when a QA or product team keeps user stories in a sheet and wants test cases and scripts generated for each story without copy and paste.
metadata:
  author: zapier
  summary: "When a user story in your sheet is added or changed, its test cases and an end-to-end test script are generated and saved to a review tab, so QA can pick them up."
  apps: "Google Sheets, ChatGPT (OpenAI)"
  category: "Engineering"
  job: "Quality assurance"
  source: "https://zapier.com/automations/engineering/quality-assurance/end-to-end-testing/create-end-to-end-test-scripts-from-sheet-user-stories"
---

# Create end to end test scripts from sheet user stories

## What it does

1. **Trigger:** a story row is updated in the stories worksheet (Google Sheets, Updated Spreadsheet Row).
2. **ChatGPT (OpenAI)** writes structured test cases for the story: Test ID, Test Case Name, Purpose, Preconditions and steps.
3. The workflow pulls the Test IDs, names and blocks out of that text, in plain code.
4. **ChatGPT (OpenAI)** writes a runnable TypeScript end-to-end test script from those blocks.
5. **Google Sheets** looks up the output row whose Story ID matches. It updates that row if found, otherwise adds a new one, with Story ID, Test IDs, a test case summary and the script.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Sheets, Updated Spreadsheet Row (`google-sheets` / `updated_row_only`). Set `spreadsheet` and `worksheet` in the trigger to your stories tab.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the user's Google Sheets connection, for the account that owns the spreadsheet.
   - `chatgpt`: the user's ChatGPT (OpenAI) connection. Connect it before running; the code uses it for both prompts.
3. **Constants:**
   - `SPREADSHEET_ID`: the long ID in the spreadsheet's URL.
   - `STORIES_WORKSHEET_ID`: the stories tab. The first tab is `"0"`. It is also the trigger's worksheet.
   - `OUTPUT_WORKSHEET_ID`: the review tab that receives the outputs. Use the tab's ID (its `gid`).
   - `STORY_ID_COLUMN`, `STORY_DESCRIPTION_COLUMN`: the columns holding the story ID and the story text, as column keys such as `COL$A`.
   - `OUTPUT_ID_COLUMN`, `OUTPUT_TEST_IDS_COLUMN`, `OUTPUT_SUMMARY_COLUMN`, `OUTPUT_SCRIPT_COLUMN`: output columns, as column keys such as `COL$A`. The output tab needs headers in these columns.
   - `CHATGPT_MODEL`: the model for both prompts. Defaults to `gpt-3.5-turbo-instruct`.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the workflow to turn on.

## Ask the user

- Which spreadsheet holds the stories, and which tab? Which columns hold the story ID and the story description?
- Which spreadsheet tab receives the outputs, and which columns hold the output ID, Test IDs, summary and script?
- Which ChatGPT (OpenAI) connection should be used, and which model? The default is `gpt-3.5-turbo-instruct`.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a story row that exists on the stories tab.

```json
{
  "COL$A": "US-101",
  "COL$B": "As a shopper, I can add an item to my cart and see the updated total."
}
```

Confirm that the output tab gets one row for `US-101`, with Test IDs such as `TC-001`, a summary, and a script that begins with TypeScript code. Run it twice to check that the second run updates the same row rather than adding one. Then tell the user to change the test row back if it was real data.

## Customize

- **Approval step:** route the generated outputs to a reviewer by email or a review column before the output row is finalized.
- **Code storage:** post the generated scripts to a code storage endpoint or a pull request system for automated repo commits.

## Notes

- Test IDs are read from `Test ID:` lines, and names from `Test Case Name:` lines. If the model does not follow that format, the run stops without writing anything.
- The trigger fires on any update to a story row, so editing a row again re-generates its outputs.
- The ChatGPT prompts are sent with the story text, so use only stories you are allowed to send to ChatGPT.
- Never commit a real spreadsheet ID or worksheet ID to a public repo.
