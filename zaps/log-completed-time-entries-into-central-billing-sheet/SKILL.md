---
name: log-completed-time-entries-into-central-billing-sheet
description: Build a Zap on Zapier that appends each stopped time entry as one row in a central billing spreadsheet, skipping internal projects, non-billable categories and entries already logged. Use when a professional services or consulting team tracks time in a time-tracking tool and wants same-day billing rows in one Google Sheet without copying by hand.
license: MIT
metadata:
  author: zapier
  summary: "Each completed time entry becomes one row in your central billing sheet the same day, with the date, hours and project filled in, and duplicates or internal time left out."
  apps: "Webhooks by Zapier, Google Sheets"
  category: "Business Owners"
  job: "Professional services consulting"
  source: "https://zapier.com/automations/business-owners/professional-services-consulting/time-billing-management/log-completed-time-entries-into-central-billing-sheet"
---

# Log completed time entries into central billing sheet

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/log-completed-time-entries-into-central-billing-sheet. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a time tracker posts each stopped entry to a Webhooks by Zapier catch hook (`webhook`, `hook_v2`).
2. **Filter:** entries for an internal project, or in a non-billable category, stop here and write nothing.
3. **Formatting** (plain code, no app step): hours are the end minus the start, as decimal hours to two places; the date is the end timestamp as MM/DD/YYYY; tags and notes join into the description.
4. **Google Sheets** looks up the entry ID in the first column. If the entry is already there, the run stops (duplicate).
5. **Google Sheets** appends one row: entry ID, date, staff name, project, hours, description.

The Zap only appends rows. It never edits or deletes what is already in the sheet.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | What goes there                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------- |
| `REPLACE_SPREADSHEET_ID` | The central billing spreadsheet. Look it up with the user's Google Sheets connection. |

Also review the defaults with them: `WORKSHEET_ID` (`"0"` is the first tab), the column keys in `config.ts` (`COL$A` to `COL$F` must be mapped to the sheet's own headers: entry ID, date, staff, project, hours, description), and `INTERNAL_PROJECTS` and `NON_BILLABLE_CATEGORIES` at the top of `workflow.ts`.

Then ask:

- Which columns hold the entry ID, date, staff, project, hours and description, and which projects are internal or categories non-billable?
- What field names does the time tracker send for the entry ID, start and end times, user name, project, tags, category and notes? The code reads `id`, `start`, `end` (ISO timestamps), and optionally `user_name`, `project`, `tags` (a list), `category` and `notes`. If the tracker names them differently, change the mapping in the code before installing.
- Should dates follow the timezone in the timestamp (as this zap does), or a fixed one?

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` (the Google account that owns the billing sheet) to the user's Google Sheets connection. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with `REPLACE_SPREADSHEET_ID` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test before publishing, with a test spreadsheet, not the live billing sheet:

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

Expected: one new row with entry ID `install-test-001`, date `10/29/2026`, hours `1.5`, staff `Install Test`, project `[install-test] Client A`, and description `design, review - [install-test] sample entry`. Then run the same payload again: the run should finish as a duplicate and add no row. If run-status tools aren't available, check the result in Google Sheets directly.

Then publish, confirm the trigger is active, and give the user the webhook URL to point their time tracker at. Ask the user to delete the test rows and the test sheet; the agent doesn't delete test data.

## Notes

- Only the first tab is written, and only the first match counts as a duplicate.
- The date comes from the end timestamp's own date part; for a timestamp with a non-UTC offset, that is the local date. Hours are rounded to two decimal places.
- Anyone with the webhook URL can add rows, so keep it and the spreadsheet ID out of shared copies.
- To notify on long entries, add a Slack or email step after the append that runs when `hours` is above a threshold, such as 8. To handle entries with no project, create a task in the project tool instead of writing a row.
