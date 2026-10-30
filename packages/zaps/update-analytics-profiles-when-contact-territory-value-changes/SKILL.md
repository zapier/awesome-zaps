---
name: update-analytics-profiles-when-contact-territory-value-changes
description: Build a Zapier Next Gen Zap that keeps an analytics profile current when a HubSpot contact's territory value changes. Use when a sales or marketing team segments or reports by territory in a sheet, and wants each contact's row updated when the CRM territory changes, without manual copying.
metadata:
  author: zapier
  summary: "When a contact's territory changes in your CRM, their analytics profile row is updated (or created) with the new territory, so segments and reports stay accurate."
  apps: "HubSpot, Google Sheets"
  category: "Data & Analytics"
  job: "Analytics automation"
  source: "https://zapier.com/automations/data-analytics/analytics-automation/customer-analytics/update-analytics-profiles-when-contact-territory-value-changes"
---

# Update analytics profiles when contact territory value changes

## What it does

1. **Trigger:** a HubSpot contact's territory property changes (HubSpot "New Contact Property Change").
2. **HubSpot** fetches the full contact: its lifecycle stage, email and territory.
3. **Skip checks:** the run stops if the contact's lifecycle stage is inactive (`unsubscribed` or `other`), or if the territory matches the value already stored in its profile row.
4. **Google Sheets** finds the profile row by HubSpot contact ID, then by email if there's no match.
5. **Google Sheets** updates that row, or adds a new one if there's no profile yet. It writes the contact ID, email, territory, lifecycle stage and an updated-at time.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** HubSpot, New Contact Property Change (`updated_contact_resthook_v3`). It needs a HubSpot connection. Set `property_name` to the territory property's internal name.
2. **Connections** (each alias in the code is the app's slug):
   - `hubspot`: the HubSpot connection, for the portal that owns the contacts. Use a test or sandbox portal when testing.
   - `google-sheets`: the Google Sheets connection, for the account that owns the profiles sheet.
3. **Constants:**
   - `SPREADSHEET_ID`: the long ID in the profiles sheet's URL.
   - `WORKSHEET_ID`: the tab with the profile rows. The first tab is `"0"`.
   - `TERRITORY_PROPERTY`: the HubSpot internal name of the territory property. It must match the trigger's `property_name`.
   - `TERRITORY_HEADER`: the header of the territory column on the sheet.
   - `CRM_ID_COLUMN`, `EMAIL_COLUMN`, `TERRITORY_COLUMN`, `LIFECYCLE_COLUMN`, `UPDATED_AT_COLUMN`: column keys such as `COL$A`, not header names. Map the user's headers to their column letters.
   - `INACTIVE_STAGES`: lifecycle stages to skip. Defaults to `unsubscribed` and `other`.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user what they need to connect it.

## Ask the user

- Which HubSpot property holds the territory? Give its internal name, which is what the trigger and the code need.
- Which sheet and tab hold the analytics profiles, and which columns hold the CRM ID, email, territory, lifecycle stage and updated-at time?
- Which lifecycle stages count as inactive? The default skips `unsubscribed` and `other`.
- Is a Google Sheet the right place for analytics profiles? If the analytics system is something else, the write steps need a different app.

## Test

Run as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, using a test HubSpot portal and a test sheet. Use a contact that exists in both, with a territory that differs from the sheet row.

```json
{
  "id": "123456789"
}
```

Check that the matching profile row's territory and updated-at changed and nothing else. Then check a contact whose territory is already in the sheet: the run should skip and write nothing. Use test data only.

## Customize

- **Notify on large territory moves:** add a Slack message to a team channel after the update, with a threshold for what counts as large.
- **Audit trail:** append a row to a mapping sheet each time a profile changes.

## Notes

- The sub-process from the original Zap is built inline, as steps in this one workflow. Durable workflows have no separate sub-zap.
- The HubSpot field names used in the code (`lifecyclestage`, `email`, and the territory property) and the contact ID the trigger delivers are not checked against a live sample. Check them on the first test run.
- The workflow reads the contact through a HubSpot action that needs a connection, so it can't run without one.
- Never commit a real spreadsheet ID or HubSpot portal details.
