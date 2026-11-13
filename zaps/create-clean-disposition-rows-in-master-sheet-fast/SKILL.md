---
name: create-clean-disposition-rows-in-master-sheet-fast
description: Build a Zap on Zapier that watches a campaign spreadsheet for updated disposition text, normalizes it to one of a fixed set of labels with AI, and appends a clean row to a master sheet. Use when campaign or call-log sheets record freeform outcomes ("call back Tuesday", "not interested") and reporting or fulfillment needs one consistent label per record in a central sheet.
license: MIT
metadata:
  author: zapier
  summary: "When a campaign sheet's disposition is updated, a cleaned row with one standard label goes into your master sheet, and anything unclear is marked for review."
  apps: "Google Sheets, AI by Zapier"
  category: "Data & Analytics"
  job: "Data automation"
  source: "https://zapier.com/automations/data-analytics/data-automation/spreadsheet-data-processing/create-clean-disposition-rows-in-master-sheet-fast"
---

# Create clean disposition rows in master sheet fast

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-clean-disposition-rows-in-master-sheet-fast. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a row in the source worksheet is updated (`google-sheets`, `updated_row_only`, "Updated Spreadsheet Row"). Brand-new rows do not trigger it.
2. **AI by Zapier** reads the disposition text and returns one of the allowed labels, or `NO MATCH`. A row with empty disposition text is skipped.
3. **Google Sheets** appends one row to the master sheet: record reference, normalized disposition, the raw text, a needs-review flag, the source's updated time, and the time the row was imported. Unmatched text is written as `Needs review` with the flag set to `yes`.

The Zap only reads the source sheet. It never changes it.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                         | Where       | What goes there                                                                      |
| ------------------------------- | ----------- | ------------------------------------------------------------------------------------ |
| `REPLACE_SOURCE_SPREADSHEET_ID` | `config.ts` | The campaign spreadsheet whose disposition rows are watched. Also set on the trigger |
| `REPLACE_MASTER_SPREADSHEET_ID` | `config.ts` | The master spreadsheet that receives the cleaned rows                                |

Also review the defaults with them: the six allowed dispositions in `ALLOWED_DISPOSITIONS` (`workflow.ts`: Interested, Not interested, Callback requested, Do not contact, No answer, Wrong number), `REVIEW_DISPOSITION` (`"Needs review"`), `SOURCE_WORKSHEET_ID` and `MASTER_WORKSHEET_ID` (`"0"` is the first tab), and `MODEL_ID`. A row with empty disposition text is skipped by default.

The columns must line up. The source sheet needs A = record reference, B = disposition text, C = updated time. The master sheet is written as A = record reference, B = disposition, C = raw text, D = needs review, E = source updated time, F = imported time.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` to the user's Google Sheets connection for the account that owns both sheets. The trigger uses the same one. AI by Zapier needs no connection; it uses a managed model credential (`authentication_id: "0"`).
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-row-only.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's spreadsheet and worksheet to `SOURCE_SPREADSHEET_ID` and `SOURCE_WORKSHEET_ID` from `config.ts`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match. The code uses `COL$A` to `COL$F` for columns, so map each one to the matching column above.

## Test it

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

Confirm that the master sheet gained one row: the record reference, disposition `Do not contact`, the raw text, an empty needs-review cell, the source time, and an imported time. Then run a second sample with unclear text (for example `qwerty banana 4417 xylophone, unclear`) and confirm the row reads `Needs review` with `yes` in the flag column. If run-status tools aren't available, check the result in Google Sheets directly. Ask the user to delete the test rows; the agent doesn't delete them. Then publish, and confirm the trigger is active.

## Notes

- The trigger fires on any edit to a row, not only on disposition changes. Set the trigger's dedupe column to the disposition column if that matters.
- Google Sheets may show timestamps in the sheet's own format and time zone.
- To write the normalized disposition back to the source row, add a Google Sheets update step after the master row is created.
- To suggest a label for `Needs review` rows, add a second AI step that writes it beside them.
- Spreadsheet IDs are personal to each user. Keep real ones out of the repo; the placeholders are replaced at build time.
