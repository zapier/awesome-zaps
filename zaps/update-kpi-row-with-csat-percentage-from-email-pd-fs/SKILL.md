---
name: update-kpi-row-with-csat-percentage-from-email-pd-fs
description: Build a Zap on Zapier that reads the first percentage out of a PDF attached to an incoming Outlook email and writes it into the matching row of an executive KPI workbook in Excel. Use when a team emails a PDF report (for example a customer satisfaction or CSAT summary) and wants its headline percentage logged into a KPI sheet without manual edits.
license: MIT
metadata:
  author: zapier
  summary: "When a PDF report arrives by email, its headline percentage is copied into the matching KPI row of your executive workbook, so the dashboard numbers stay current."
  apps: "Microsoft Outlook, Microsoft Excel, ChatGPT (OpenAI)"
  category: "Data & Analytics"
  job: "Business intelligence"
  source: "https://zapier.com/automations/data-analytics/business-intelligence/reporting-management/update-kpi-row-with-csat-percentage-from-email-pd-fs"
---

# Update KPI row with CSAT percentage from email

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-kpi-row-with-csat-percentage-from-email-pd-fs. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new attachment arrives in the inbox (`microsoft-outlook`, `new_attachment`). Anything that is not a PDF is skipped.
2. **ChatGPT** reads the attached PDF and returns the first numeric percentage in it (for example `87%`). If there is none, the run stops and writes nothing.
3. **Microsoft Excel** finds the KPI row whose lookup column matches the PDF's file name, without the `.pdf` extension. If there is no match, the run stops and no row is created.
4. **Microsoft Excel** writes the percentage into the KPI column of that row.

The Zap only writes a percentage it found in the PDF. It never creates rows or edits any other cell.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                 | What goes there                                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_WORKBOOK_ID`   | The Excel workbook holding the executive KPI table. It must be on OneDrive for Business; look up its ID from the user's Excel connection |
| `REPLACE_WORKSHEET_ID`  | The tab in that workbook that holds the KPI rows; look up its ID from the workbook                                                       |
| `REPLACE_LOOKUP_COLUMN` | The header of the column the PDF's file name, without the `.pdf` extension, is matched against                                           |
| `REPLACE_KPI_COLUMN`    | The header of the column that receives the percentage                                                                                    |

Also review the defaults with them: the ChatGPT model `gpt-4o` and the extraction prompt in `workflow.ts`.

Ask whether the file name should match the row, or whether the report has a better key, such as an owner name or metric code. Before turning it on, confirm the user has connected Microsoft Excel and ChatGPT in Zapier.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `chatgpt` (for the PDF read) and `excel` (the find-row and update-row steps; the workbook must be on OneDrive for Business) to the user's connections. Bind `microsoft-outlook` to the user's Outlook connection for the trigger.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-attachment.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a test PDF named `CSAT-test.pdf` attached to a test email in the inbox, and a test row in the workbook whose lookup column reads `CSAT-test`:

```json
{
  "attachment__fileName": "CSAT-test.pdf",
  "attachment__file": "<the attachment file from the Outlook trigger>"
}
```

Check that the reply contains one `N%` value, that only the row whose lookup column reads `CSAT-test` changed, and that its KPI column now shows that percentage. If run-status tools aren't available, check the workbook in Microsoft Excel directly. Ask the user to delete the test email and the test row, not the agent.

## Notes

- Excel's `update_row` takes column headers as input keys. Before the first run, confirm each header in `REPLACE_LOOKUP_COLUMN` and `REPLACE_KPI_COLUMN` matches the sheet exactly.
- If two rows share the lookup value, only the first match is updated.
- To email the row owner when the model returns `MISSING`, add an Outlook step that sends a message and leaves the row alone.
- To record the source file name for auditing, add it to the `update_row` inputs in a notes column.
- Never commit a real workbook ID or email address. Keep them in your own copy's settings.
