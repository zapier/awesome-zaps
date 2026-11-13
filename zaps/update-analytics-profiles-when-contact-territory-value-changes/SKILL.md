---
name: update-analytics-profiles-when-contact-territory-value-changes
description: Build a Zap on Zapier that keeps an analytics profile current when a HubSpot contact's territory value changes. Use when a sales or marketing team segments or reports by territory in a sheet, and wants each contact's row updated when the CRM territory changes, without manual copying.
license: MIT
metadata:
  author: zapier
  summary: "When a contact's territory changes in your CRM, their analytics profile row is updated (or created) with the new territory, so segments and reports stay accurate."
  apps: "HubSpot, Google Sheets"
  category: "Data & Analytics"
  job: "Analytics automation"
  source: "https://zapier.com/automations/data-analytics/analytics-automation/customer-analytics/update-analytics-profiles-when-contact-territory-value-changes"
---

# Update analytics profiles when contact territory value changes

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-analytics-profiles-when-contact-territory-value-changes. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a HubSpot contact's territory property changes (`hubspot`, `updated_contact_resthook_v3`, New Contact Property Change).
2. **HubSpot** fetches the full contact: its lifecycle stage, email and territory.
3. **Skip checks:** the run stops if the contact's lifecycle stage is inactive (`unsubscribed` or `other`), or if the territory matches the value already stored in its profile row.
4. **Google Sheets** finds the profile row by HubSpot contact ID, then by email if there's no match.
5. **Google Sheets** updates that row, or adds a new one if there's no profile yet. It writes the contact ID, email, territory, lifecycle stage and an updated-at time.

The Zap only writes to the profiles sheet. It never changes the contact in HubSpot.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                      | Where                                                                                          | What goes there                                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `REPLACE_TERRITORY_PROPERTY` | `config.ts`, `TERRITORY_PROPERTY`; and `triggers/updated-contact-resthook.ts`, `property_name` | The HubSpot internal name of the territory property, looked up from the user's HubSpot account    |
| `REPLACE_SPREADSHEET_ID`     | `config.ts`, `SPREADSHEET_ID`                                                                  | The profiles sheet, looked up from the user's Google Sheets. Its ID is the long string in its URL |

Also review these defaults with the user:

- `WORKSHEET_ID`: the tab with the profile rows. `"0"` is the first tab.
- `TERRITORY_HEADER`: the header of the territory column on that tab.
- `CRM_ID_COLUMN`, `EMAIL_COLUMN`, `TERRITORY_COLUMN`, `LIFECYCLE_COLUMN` and `UPDATED_AT_COLUMN` in `config.ts` (`COL$A` to `COL$E`): map the user's headers to their column letters, since these are column keys, not header names.
- `INACTIVE_STAGES` in `workflow.ts`: the lifecycle stages to skip. Defaults to `unsubscribed` and `other`.

Before turning it on, confirm a Google Sheet is the right place for analytics profiles. If the analytics system is something else, the write steps need a different app.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `hubspot` (the trigger and the HubSpot step) to the user's HubSpot connection for the portal that owns the contacts, and `google-sheets` (both sheet steps) to the connection for the account that owns the profiles sheet.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. The same answer fills `property_name` in `triggers/updated-contact-resthook.ts`. `triggers/updated-contact-resthook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a test HubSpot portal and a test sheet. Use a contact that exists in both, with a territory that differs from the sheet row:

```json
{
  "id": "123456789"
}
```

Check that the matching profile row's territory and updated-at changed and nothing else. Then run it on a contact whose territory is already in the sheet: the run should skip and write nothing. If run-status tools aren't available, check the result in Google Sheets directly. Then publish and confirm the trigger is active. The user deletes the test data, not the agent.

## Notes

- Everything runs as steps in one workflow. There is no separate sub-zap.
- The HubSpot field names in the code (`lifecyclestage`, `email`, and the territory property) and the contact ID the trigger delivers are not checked against a live sample. Check them on the first test run.
- The workflow reads each contact through the HubSpot connection, so the Zap can't run without one.
- To extend it: post to a Slack channel after the update when a territory move is large, or append a row to a mapping sheet on each change.
- Never commit a real spreadsheet ID or HubSpot portal details.
