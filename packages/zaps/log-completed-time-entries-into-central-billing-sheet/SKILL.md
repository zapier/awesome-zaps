---
name: log-completed-time-entries-into-central-billing-sheet
description: Build a Zapier Next Gen Zap that appends each stopped time entry as one row in a central billing spreadsheet, skipping internal projects, non-billable categories and entries already logged. Use when a professional services or consulting team tracks time in a time-tracking tool and wants same-day billing rows in one Google Sheet without copying by hand.
metadata:
  author: zapier
  summary: "Each completed time entry becomes one row in your central billing sheet the same day, with the date, hours and project filled in, and duplicates or internal time left out."
  apps: "Webhooks by Zapier, Google Sheets"
  category: "Business Owners"
  job: "Professional services consulting"
  source: "https://zapier.com/automations/business-owners/professional-services-consulting/time-billing-management/log-completed-time-entries-into-central-billing-sheet"
---

# Log completed time entries into central billing sheet

## What it does

1. **Trigger:** a time tracker posts each stopped entry to a Webhooks by Zapier catch hook.
2. **Filter:** entries for an internal project, or in a non-billable category, stop here and write nothing.
3. **Formatting** (plain code, no app step): hours are the end minus the start, as decimal hours to two places; the date is the end timestamp as MM/DD/YYYY; tags and notes join into the description.
4. **Google Sheets** looks up the entry ID in the first column. If the entry is already there, the run stops (duplicate).
5. **Google Sheets** appends one row: entry ID, date, staff name, project, hours, description.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, action `hook_v2`). It needs no connection, so `authentication_id` is `null` and `params` is `{}`.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the Google account that owns the billing sheet.
3. **Constants:**
   - `SPREADSHEET_ID`: the long ID in the billing sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `INTERNAL_PROJECTS`: project names that are never billed.
   - `NON_BILLABLE_CATEGORIES`: categories that are never billed.
   - `ENTRY_ID_COLUMN`, `DATE_COLUMN`, `STAFF_COLUMN`, `PROJECT_COLUMN`, `HOURS_COLUMN`, `DESCRIPTION_COLUMN`: column keys such as `COL$A`, not header names. Map the sheet's headers to their column letters.
4. Test with the sample below, then publish, confirm the trigger is active, and give the user their webhook URL to point the time tracker at.

The payload fields the code reads are `id`, `start`, `end` (ISO timestamps), and optionally `user_name`, `project`, `tags` (a list), `category` and `notes`. If the time tracker names them differently, change the mapping in the code before installing.

## Ask the user

- Which spreadsheet and tab hold the central billing sheet, and which columns hold the entry ID, date, staff, project, hours and description?
- Which project names are internal, and which categories are non-billable?
- What field names does the time tracker send for the entry ID, start and end times, user name, project, tags, category and notes?
- Should dates follow the timezone in the timestamp (as this zap does), or a fixed one?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, using a test spreadsheet, not the live billing sheet:

```json
{
  "id": "install-test-001",
  "start": "2026-10-29T09:00:00Z",
  "end": "2026-10-29T10:30:00Z",
  "user_name": "Install Test",
  "project": "[install-test] Client A",
  "tags": ["design", "review"],
  "category": "Billable",
  "notes": "[install-test] sample entry"
}
```

Expected: one new row with entry ID `install-test-001`, date `10/29/2026`, hours `1.5`, staff `Install Test`, project `[install-test] Client A`, and description `design, review - [install-test] sample entry`. Then run the same payload again: the run should finish as a duplicate and add no row. Afterwards, delete the test rows and the test sheet.

## Customize

- **Team notification for long entries:** after the append step, send one Slack message (or email) when `hours` is above a threshold, such as 8.
- **Missing-project task:** when `project` is empty, create a task in the project tool instead of writing a billing row.

## Notes

- Only the first tab is written, and only the first match counts as a duplicate.
- The date comes from the end timestamp's own date part. For a timestamp with a non-UTC offset, that is the local date.
- Hours are rounded to two decimal places.
- Keep the spreadsheet ID and webhook URL out of shared copies. Anyone with the webhook URL can add rows.
