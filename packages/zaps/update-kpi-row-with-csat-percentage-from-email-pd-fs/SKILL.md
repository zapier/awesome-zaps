---
name: update-kpi-row-with-csat-percentage-from-email-pd-fs
description: Build a Zapier Next Gen Zap that reads the first percentage out of a PDF attached to an incoming Outlook email and writes it into the matching row of an executive KPI workbook in Excel. Use when a team emails a PDF report (for example a customer satisfaction or CSAT summary) and wants its headline percentage logged into a KPI sheet without manual edits.
metadata:
  author: zapier
  summary: "When a PDF report arrives by email, its headline percentage is copied into the matching KPI row of your executive workbook, so the dashboard numbers stay current."
  apps: "Microsoft Outlook, Microsoft Excel, ChatGPT (OpenAI)"
  category: "Data & Analytics"
  job: "Business intelligence"
  source: "https://zapier.com/automations/data-analytics/business-intelligence/reporting-management/update-kpi-row-with-csat-percentage-from-email-pd-fs"
---

# Update KPI row with CSAT percentage from email

## What it does

1. **Trigger:** a new attachment arrives in the inbox (Microsoft Outlook, New Attachment). Anything that is not a PDF is skipped.
2. **ChatGPT** reads the attached PDF and returns the first numeric percentage in it (for example `87%`). If there is none, the run stops and writes nothing.
3. **Microsoft Excel** finds the KPI row whose lookup column matches the PDF's file name, without the `.pdf` extension. If there is no match, the run stops and no row is created.
4. **Microsoft Excel** writes the percentage into the KPI column of that row.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Microsoft Outlook, New Attachment (`microsoft-outlook`, `new_attachment`). Leave the parent folder blank to watch the whole inbox. The code filters for PDFs.
2. **Connections** (each alias in the code is the app's slug or a short name):
   - `chatgpt`: ChatGPT (OpenAI), `chatgpt`, for the PDF read.
   - `excel`: Microsoft Excel, `excel`, for the find-row and update-row steps. The workbook must be on OneDrive for Business, which is the only storage Zapier's Excel app supports.
   - The trigger uses the user's Outlook connection directly and needs no alias.
3. **Constants:**
   - `WORKBOOK_ID`: the long ID in the workbook's URL.
   - `WORKSHEET_ID`: the tab that holds the KPI rows.
   - `LOOKUP_COLUMN`: the header of the column the PDF file name is matched against.
   - `KPI_COLUMN`: the header of the column the percentage is written to.

## Ask the user

- Which workbook and tab hold the KPI rows?
- Which column should the PDF's file name match against, and which column gets the percentage?
- Should the file name match the row, or is there a better key (an owner name or metric code) in the report?
- Connect Microsoft Excel and ChatGPT in Zapier. Neither has a connection in the test account.

## Test

When you want a test, sign in to both apps, then run this sample as a draft test run (`run_workflow_draft`) with a real attachment in the test inbox. Use a PDF whose file name matches a row you created for the test:

```json
{
  "attachment__fileName": "CSAT-test.pdf",
  "attachment__file": "<the attachment file from the Outlook trigger>"
}
```

Check that the reply contains one `N%` value, that only the row whose lookup column reads `CSAT-test` changed, and that its KPI column now shows that percentage. Then remove the test row.

## Customize

- **Notify the row owner** by email when the model returns `MISSING`: add an Outlook step to send the owner a message, with no action on the row.
- **Record the source file name** in a notes column for auditing: add the file name to the `update_row` inputs.

## Notes

- Excel's `update_row` takes column headers as input keys. Before the first run, confirm each header in `LOOKUP_COLUMN` and `KPI_COLUMN` matches the sheet exactly.
- If two rows share the lookup value, only the first match is updated.
- Never commit a real workbook ID or email address. Keep them in the constants of your own copy.
