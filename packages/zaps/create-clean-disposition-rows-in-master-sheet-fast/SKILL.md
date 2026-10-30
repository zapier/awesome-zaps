---
name: create-clean-disposition-rows-in-master-sheet-fast
description: Build a Zapier Next Gen Zap that watches a campaign spreadsheet for updated disposition text, normalizes it to one of a fixed set of labels with AI, and appends a clean row to a master sheet. Use when campaign or call-log sheets record freeform outcomes ("call back Tuesday", "not interested") and reporting or fulfillment needs one consistent label per record in a central sheet.
metadata:
  author: zapier
  summary: "When a campaign sheet's disposition is updated, a cleaned row with one standard label goes into your master sheet, and anything unclear is marked for review."
  apps: "Google Sheets, AI by Zapier"
  category: "Data & Analytics"
  job: "Data automation"
  source: "https://zapier.com/automations/data-analytics/data-automation/spreadsheet-data-processing/create-clean-disposition-rows-in-master-sheet-fast"
---

# Create clean disposition rows in master sheet fast

## What it does

1. **Trigger:** a row in the source worksheet is updated (Google Sheets, Updated Spreadsheet Row). Brand-new rows do not trigger it.
2. **AI by Zapier** reads the disposition text and returns one of the allowed labels, or `NO MATCH`. A row with empty disposition text is skipped.
3. **Google Sheets** appends one row to the master sheet: record reference, normalized disposition, the raw text, a needs-review flag, the source's updated time, and the time the row was imported. Unmatched text is written as `Needs review` with the flag set to `yes`.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top; everything else stays as written.

1. **Trigger:** Google Sheets, `updated_row_only` ("Updated Spreadsheet Row"), pinned to `google-sheets`. Set its spreadsheet to the source sheet and its worksheet to the tab. It has no dedupe column, so any edit to a row fires it.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the user's Google Sheets connection, for the account that owns both sheets. The trigger uses the same connection.
   - `ai`: no connection. It uses a managed model credential (`authentication_id: "0"`).
3. **Constants:**
   - `SOURCE_SPREADSHEET_ID` and `SOURCE_WORKSHEET_ID`: the sheet and tab the trigger watches. The trigger config holds these values; the code does not read them.
   - `MASTER_SPREADSHEET_ID`, `MASTER_WORKSHEET_ID`: where cleaned rows are appended.
   - `ALLOWED_DISPOSITIONS`: the six labels. Replace them with your own.
   - `REVIEW_DISPOSITION`: the label for unmatched text. Defaults to `"Needs review"`.
   - `MODEL_ID`: the AI model tier. Defaults to `"standard/auto"`.
4. Column keys in the code are `COL$A`…`COL$F`. Map them to the user's columns:
   - Source: A = record reference, B = disposition text, C = updated time.
   - Master: A = record reference, B = disposition, C = raw text, D = needs review, E = source updated time, F = imported time.
5. Test with the steps below, then publish, wait until the trigger is active, and tell the user where to point their edits.

## Ask the user

- Which spreadsheet and tab hold the campaign disposition rows, and which columns hold the record reference, disposition text and updated time?
- Which spreadsheet and tab is the master sheet, and what are its columns?
- What are the six allowed dispositions? The defaults are Interested, Not interested, Callback requested, Do not contact, No answer and Wrong number.
- Should a row with empty disposition text be skipped, as it is here?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. It uses the same shape the trigger delivers, on a test row:

```json
{
  "id": 2,
  "row": 2,
  "COL$A": "[install-test] REC-1001",
  "_content_hash": "7c873bde89dae3129ba44f912cf6cdc5",
  "COL$B": "Not interested anymore, please remove me",
  "COL$C": "2026-10-29 9:05:00"
}
```

Confirm that the master sheet gained one row: the record reference, disposition `Do not contact`, the raw text, an empty needs-review cell, the source time, and an imported time. Then run a second sample with unclear text (for example `qwerty banana 4417 xylophone, unclear`) and confirm the row reads `Needs review` with `yes` in the flag column. Delete the test rows afterwards.

## Customize

- **Update the source row** with the normalized disposition: add a Google Sheets update step after the master row is created.
- **Tag ambiguous cases for a person:** add a second AI step that suggests a label for `Needs review` rows and writes it beside them.

## Notes

- The trigger fires on any edit to a row, not only on disposition changes. Set the trigger's dedupe column to the disposition column if that matters.
- Google Sheets may show timestamps in the sheet's own format and time zone.
- Never commit a real spreadsheet ID. The placeholders in this copy must be replaced in the constants at build time.
