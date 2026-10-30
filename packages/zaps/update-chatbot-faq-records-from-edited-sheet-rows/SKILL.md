---
name: update-chatbot-faq-records-from-edited-sheet-rows
description: Build a Zapier Next Gen Zap that pushes edits from a master FAQ Google Sheet into a Zapier Table, matching records by question text, updating the answer and version when they change and creating a record when the question is new. Use when a support team keeps FAQ answers in a sheet and wants the table their chatbot or help center reads from to stay current without copy-pasting.
metadata:
  author: zapier
  summary: "When someone edits an answer in your FAQ sheet, the matching record in your Zapier Table is updated (or created if the question is new), so your chatbot always uses the latest answer."
  apps: "Google Sheets, Zapier Tables"
  category: "Customer Service & Success"
  job: "Self service support"
  source: "https://zapier.com/automations/customer-service-success/self-service-support/faq-help-center-management/update-chatbot-faq-records-from-edited-sheet-rows"
---

# Update chatbot FAQ records from edited sheet rows

## What it does

1. **Trigger:** a row in the FAQ worksheet is edited (Google Sheets, Updated Spreadsheet Row). New rows do not fire it.
2. **Zapier Tables** looks up the record whose question field exactly matches the row's question. A row with no question stops the run.
3. If a record matches and its answer and version already equal the sheet's, the run stops without writing.
4. Otherwise **Zapier Tables** updates that record with the sheet's question, answer and version, the sync time in the last-edited field, and the sheet row number. If nothing matched, it creates a record with the same fields.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Sheets, Updated Spreadsheet Row (`google-sheets`, `updated_row_only`; tested on `google-sheets`). `authentication_id` is the user's Google Sheets connection. `params`: `spreadsheet` (the sheet's ID) and `worksheet` (the tab; the first is `"0"`). Leave `dedupe_column` empty so edits to any column fire it.
2. **Connections:**
   - Google Sheets: used only by the trigger, through its `authentication_id`. The code makes no Sheets calls.
   - Zapier Tables (`zapier-tables`): needs no connection. The steps carry no `connection:`, and the draft's `connections` map stays empty.
3. **Constants:**
   - `TABLE_ID`: the Zapier Table's ID (from its URL or Tables' Find Table action).
   - `QUESTION_COLUMN`, `ANSWER_COLUMN`, `VERSION_COLUMN`: sheet column keys such as `COL$A`, not header names. Set `VERSION_COLUMN` to `null` if the sheet has no version column.
   - `QUESTION_FIELD`, `ANSWER_FIELD`, `VERSION_FIELD`, `LAST_EDITED_FIELD`, `SHEET_ROW_FIELD`: table field IDs such as `f1`. Read them from `inspect_zapier_actions` on Tables' Update Record with the table ID set: field `new__data__f2` is field ID `f2`. `LAST_EDITED_FIELD` should be a Date & Time field.
4. Test with the steps below, then publish with the trigger and wait until it reads back `active`.

If the user has no table yet, create one with Tables' Create Table: Question (Text), Answer (Long Text), Version (Text), Last Edited (Date & Time), Sheet Row (Text). The field IDs then run `f1` to `f5`, as in the code.

## Ask the user

- Which spreadsheet and tab is the master FAQ sheet, and which columns hold the question, answer and version?
- Which Zapier Table does the chatbot read, and which fields hold the question, answer, version, last-edited time and source row? Offer to create the table if they don't have one.
- Should a brand-new question create a record? The spec says yes, and the code does this.

## Test

Seed the table with one record for a question that is in the sheet, using an older answer and version. Then run a draft test run (`run_workflow_draft`) with that row as input, in the trigger's shape:

```json
{
  "COL$A": "[install-test] How do I reset my password?",
  "COL$B": "Go to Settings > Security and click Reset password. A reset link is emailed within 5 minutes.",
  "COL$C": "v2",
  "id": 2,
  "row": 2
}
```

Read the record back with Tables' Find Records. Its answer and version should match the input, Last Edited should hold the run time and Sheet Row should be `2`. Run again with a question the table doesn't have (`"COL$A": "[install-test] Do you offer refunds?"`, row 3). Exactly one new record should appear with those values. Optionally, rerun the first input: it should return `skipped: answer-and-metadata-unchanged` and write nothing.

## Customize

- **Notify on major changes:** add a Slack or email step after the update, for example when the version changes or the answer changes by more than a set amount.
- **Only sync qualifying rows:** add a filter before the lookup, for example on a Published column or a set version, and skip rows that don't qualify.

## Notes

- Matching is on the exact question text, so editing the question itself creates a new record and leaves the old one. To keep the record, match on a stable ID column instead.
- If two records share a question, Tables uses the most recently created one.
- The trigger polls, so edits reach the table a few minutes later, not instantly.
- Last Edited is the time the workflow synced the row, not the time of the sheet edit. The Google Sheets trigger does not supply an edit time.
- Never commit a real spreadsheet or table ID.
