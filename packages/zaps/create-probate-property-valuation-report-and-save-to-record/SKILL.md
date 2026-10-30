---
name: create-probate-property-valuation-report-and-save-to-record
description: Build a Zapier Next Gen Zap that takes a probate valuation record, creates a formatted valuation report from a Google Docs template, and writes the report link and document ID back to the record for case tracking. Use when a legal or estate team keeps valuation records in Zapier Tables and wants a finished report generated and linked without manual copying.
metadata:
  author: zapier
  summary: "When a probate valuation record is ready, a polished report is generated from your template and its link is saved on the record, so case tracking stays current."
  apps: "Webhooks by Zapier, Zapier Tables, Google Docs"
  category: "Legal"
  job: "Legal document automation"
  source: "https://zapier.com/automations/legal/legal-document-automation/document-assembly/create-probate-property-valuation-report-and-save-to-record"
---

# Create probate property valuation report and save to record

## What it does

1. **Trigger:** a Webhooks by Zapier catch hook receives a request with the valuation record's ID (`record_id`). Your records system or another Zap posts it when a record is ready.
2. **Zapier Tables** finds the valuation record by its record ID. If there is no match, the run stops and writes nothing.
3. **Code** (plain JavaScript in the workflow) tidies the comparables into clean lines and turns the valuation and date-of-death values into long dates such as "5 March 2026".
4. **Google Docs** creates a new document from your valuation template, fills in the case title, property address, dates and comparables, removes unused template fields, and shares the document with your organization.
5. **Zapier Tables** saves the document's link in the record's "Report link" field and its ID in "Document ID", so case tracking points at the report.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `zapier-tables`: the Zapier Tables account that holds the valuation table.
   - `google-docs`: the Google account that owns the template and the report folder.
3. **Constants:**
   - `TABLE_ID`: the Zapier Tables table that holds the valuation records.
   - `TEMPLATE_DOC_ID`: the Google Doc used as the report template. Its placeholders must be `{{case_title}}`, `{{property_address}}`, `{{valuation_date}}`, `{{date_of_death}}` and `{{comparables}}`.
   - `FOLDER_ID`: the folder for new reports. `root` means the top level of My Drive.
   - `SHARING_PREFERENCE`: who can open a new report by link. The default gives your organization edit access by link.

## Ask the user

- Which Zapier Tables table holds the valuation records, and which fields hold the case title, property address, valuation date, date of death, comparables, report link and document ID?
- Which Google Doc is the valuation template, and does it use the placeholder names above?
- Which folder or shared drive should reports go in, and who should be able to open them by link?
- What will your records system send as the record ID? The payload must carry it as `record_id`. If the field has another name, tell us before installing; the code rejects payloads without `record_id`.

## Test

Run this sample as a draft test run before publishing, with a record ID that exists in your valuation table. Use a test table and a test template if you have them:

```json
{
  "record_id": "YOUR_TEST_RECORD_ID"
}
```

Check that the record's "Report link" and "Document ID" fields now hold the new report's link and ID, that the new report is in the chosen folder, and that its fields are filled in with the record's values and the dates in long form. Then delete the test report if it was not real.

## Customize

- **Alternate template on a date of death:** choose a second template when the date-of-death field is filled in, and pick the template in the create step.
- **Notify the assigned owner:** add an email or chat step after the report is saved, so the owner knows the report is ready.

## Notes

- Google Docs dates and times follow the document's own time zone settings; the workflow formats dates in UK long form.
- Unused template placeholders are removed, so a report never shows a raw `{{placeholder}}`.
- Anyone with the webhook URL can start a report run. Keep the URL private.
- Never commit a real table ID, template ID, folder ID or webhook URL.
