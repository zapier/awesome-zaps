---
name: create-probate-property-valuation-report-and-save-to-record
description: Build a Zap on Zapier that takes a probate valuation record, creates a formatted valuation report from a Google Docs template, and writes the report link and document ID back to the record for case tracking. Use when a legal or estate team keeps valuation records in Zapier Tables and wants a finished report generated and linked without manual copying.
license: MIT
metadata:
  author: zapier
  summary: "When a probate valuation record is ready, a polished report is generated from your template and its link is saved on the record, so case tracking stays current."
  apps: "Webhooks by Zapier, Zapier Tables, Google Docs"
  category: "Legal"
  job: "Legal document automation"
  source: "https://zapier.com/automations/legal/legal-document-automation/document-assembly/create-probate-property-valuation-report-and-save-to-record"
---

# Create probate property valuation report and save to record

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-probate-property-valuation-report-and-save-to-record. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Webhooks by Zapier catch hook (`webhook`) receives a request with the valuation record's ID (`record_id`). Your records system or another Zap posts it when a record is ready.
2. **Zapier Tables** (`zapier-tables`) finds the valuation record by its record ID. If there is no match, the run stops and writes nothing.
3. **Code** (in the workflow) tidies the comparables into clean lines and turns the valuation and date-of-death values into long dates such as "5 March 2026".
4. **Google Docs** (`google-docs`) creates a new document from your valuation template, fills in the case title, property address, dates and comparables, removes unused template fields, and shares the document with your organization.
5. **Zapier Tables** saves the document's link in the record's "Report link" field and its ID in "Document ID", so case tracking points at the report.

The Zap only creates new documents from the template. It never edits the template or sends the report to anyone.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                   | What goes there                                                                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `REPLACE_TABLE_ID`        | The Zapier Tables table that holds the valuation records. Look it up with the user's Zapier Tables connection.                                                                                               |
| `REPLACE_TEMPLATE_DOC_ID` | The Google Doc used as the report template, by its long ID from the URL. Its placeholders must be `{{case_title}}`, `{{property_address}}`, `{{valuation_date}}`, `{{date_of_death}}` and `{{comparables}}`. |
| `REPLACE_FOLDER_ID`       | The folder for new reports. `root` means the top level of My Drive.                                                                                                                                          |

Also review the default with them: `SHARING_PREFERENCE` in `config.ts` is `org_link_edit`, so anyone at their organization with the link can edit a new report. Confirm that is who should have access.

Prerequisites to confirm before building:

- Which fields of that table hold the case title, property address, valuation date, date of death, comparables, report link and document ID? The workflow reads them as `f1` to `f5` and writes the report link to `f6` and the document ID to `f7`, so the table's fields must match.
- What will the records system send as the record ID? It must arrive as `record_id`, and the workflow rejects payloads without it.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `zapier-tables` to the Zapier Tables account that holds the valuation table, and `google-docs` to the Google account that owns the template and the report folder. The catch hook needs no connection, so its `authentication_id` is `null`.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger, if it has one, before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a record ID from a test table the user controls, and a test template if they have one:

```json
{
  "record_id": "test-record-001"
}
```

Check that the record's "Report link" and "Document ID" fields hold the new report's link and ID, that the report is in the chosen folder, and that its fields are filled in with the record's values and the dates in long form. If run-status tools aren't available, check Zapier Tables and Google Docs directly. Ask the user to delete any test report; the agent does not delete test data.

## Notes

- To change the template by date of death, add a second template choice and pick it in the create step. To tell the owner the report is ready, add an email or chat step after the report is saved.
- Google Docs dates and times follow the document's own time zone settings; the workflow formats dates in UK long form.
- Unused template placeholders are removed, so a report never shows a raw `{{placeholder}}`.
- Anyone with the webhook URL can start a report run, so keep the URL private.
- Keep real table, template and folder IDs and the webhook URL out of any shared copy of this zap.
