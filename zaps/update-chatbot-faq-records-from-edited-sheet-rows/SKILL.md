---
name: update-chatbot-faq-records-from-edited-sheet-rows
description: Build a Zap on Zapier that pushes edits from a master FAQ Google Sheet into a Zapier Table, matching records by question text, updating the answer and version when they change and creating a record when the question is new. Use when a support team keeps FAQ answers in a sheet and wants the table their chatbot or help center reads from to stay current without copy-pasting.
license: MIT
metadata:
  author: zapier
  summary: "When someone edits an answer in your FAQ sheet, the matching record in your Zapier Table is updated (or created if the question is new), so your chatbot always uses the latest answer."
  apps: "Google Sheets, Zapier Tables"
  category: "Customer Service & Success"
  job: "Self service support"
  source: "https://zapier.com/automations/customer-service-success/self-service-support/faq-help-center-management/update-chatbot-faq-records-from-edited-sheet-rows"
---

# Update chatbot FAQ records from edited sheet rows

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-chatbot-faq-records-from-edited-sheet-rows. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a row in the master FAQ sheet is edited (`google-sheets`, `updated_row_only`). New rows do not fire it.
2. **Zapier Tables** looks up the record whose question field exactly matches the row's question. A row with no question stops the run.
3. If a record matches and its answer and version already equal the sheet's, the run stops without writing.
4. Otherwise **Zapier Tables** updates that record with the sheet's question, answer and version, the sync time in the last-edited field, and the sheet row number. If nothing matched, it creates a record with the same fields.

The Zap only writes to the table. It never changes the sheet.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | Where                                         | What goes there                    |
| ------------------------ | --------------------------------------------- | ---------------------------------- |
| `REPLACE_TABLE_ID`       | `config.ts`, `TABLE_ID`                       | The Zapier Table the chatbot reads |
| `REPLACE_SPREADSHEET_ID` | `triggers/updated-row-only.ts`, `spreadsheet` | The master FAQ sheet               |

Also review the defaults with them: the sheet columns (`QUESTION_COLUMN` and `ANSWER_COLUMN` in `config.ts`, and `VERSION_COLUMN` in `workflow.ts`; these are column keys such as `COL$A`, not header names, and `VERSION_COLUMN` goes to `null` if the sheet has no version column), the table field IDs (`QUESTION_FIELD` to `SHEET_ROW_FIELD` in `config.ts`, `f1` to `f5`), and the worksheet in the trigger (`"0"` is the first tab). Read the table field IDs from `inspect_zapier_actions` on Zapier Tables' Update Record with the table ID set: field `new__data__f2` is field ID `f2`. `LAST_EDITED_FIELD` should be a Date & Time field.

If the user has no table yet, create one with Zapier Tables' Create Table: Question (Text), Answer (Long Text), Version (Text), Last Edited (Date & Time), Sheet Row (Text). The field IDs then run `f1` to `f5`, as in the code.

Confirm that a brand-new question should create a record. The code does this.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` (used by the trigger only, to read the FAQ sheet) to the user's Google Sheets connection for the account that owns the FAQ sheet. Zapier Tables needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with `REPLACE_TABLE_ID` replaced by the user's answer. `triggers/updated-row-only.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, with `REPLACE_SPREADSHEET_ID` replaced by the sheet's ID and the trigger's `dedupe_column` left empty, so edits to any column fire it. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Seed the table with one record for a question that is in the sheet, using an older answer and version. Then run a draft test (`run_workflow_draft`) with that row as input, in the trigger's shape:

```json
{
  "COL$A": "[install-test] How do I reset my password?",
  "COL$B": "Go to Settings > Security and click Reset password. A reset link is emailed within 5 minutes.",
  "COL$C": "v2",
  "id": 2,
  "row": 2
}
```

Read the record back with Zapier Tables' Find Records. Its answer and version should match the input, Last Edited should hold the run time and Sheet Row should be `2`. Run again with a question the table doesn't have (`"COL$A": "[install-test] Do you offer refunds?"`, row 3). Exactly one new record should appear with those values. Optionally, rerun the first input: it should return `skipped: answer-and-metadata-unchanged` and write nothing.

If run-status tools aren't available, check the result in Zapier Tables directly. Ask the user to delete the test records; the agent doesn't delete them.

## Notes

- Matching is on the exact question text, so editing the question creates a new record and leaves the old one. To keep the record, match on a stable ID column instead.
- If two records share a question, Tables uses the most recently created one.
- The trigger polls, so edits reach the table a few minutes later, not instantly.
- Last Edited is the time the workflow synced the row, not the time of the sheet edit, since the Google Sheets trigger does not supply an edit time.
- To notify on major changes, add a Slack or email step after the update, for example when the version or the answer changes by more than a set amount.
- To sync only qualifying rows, add a filter before the lookup, for example on a Published column or a set version.
- Never commit a real spreadsheet or table ID.
