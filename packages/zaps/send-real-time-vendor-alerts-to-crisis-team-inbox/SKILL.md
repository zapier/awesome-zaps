---
name: send-real-time-vendor-alerts-to-crisis-team-inbox
description: Build a Zapier Next Gen Zap that emails a plain-text alert from Microsoft Outlook whenever a row in a Google Sheets vendor tracker is updated and flagged as an alert, with the vendor, title, summary, a details excerpt and a link back to the row. Use when a crisis, PR or account team logs vendor incidents in a sheet and wants flagged ones in their inbox right away instead of watching the sheet.
metadata:
  author: zapier
  summary: "When a vendor row in your tracking sheet is flagged as an alert, your crisis team gets an email with the details and a link to the row."
  apps: "Google Sheets, Microsoft Outlook"
  category: "Executives"
  job: "Crisis incident management"
  source: "https://zapier.com/automations/executives/crisis-incident-management/crisis-communication-distribution/send-real-time-vendor-alerts-to-crisis-team-inbox"
---

# Send real-time vendor alerts to crisis team inbox

## What it does

1. **Trigger:** a row in the tracker worksheet is updated (Google Sheets, Updated Spreadsheet Row). New rows don't fire it, only edits to existing rows.
2. **Filter (code):** the run continues only if the alert column holds `Yes`, `Y`, `True`, `X` or `Alert` (case doesn't matter). Any other value returns `skipped: not-an-alert-row`.
3. **Microsoft Outlook** sends one plain-text email:
   - **Subject:** `[Vendor alert] <vendor>: <title>`
   - **Body:** the vendor, title, summary, up to 500 characters of the details column, the row number, a link to the row and a change ID.
   - **Recipients:** the row's own recipients column if it has addresses (separated by commas or semicolons), otherwise `DEFAULT_RECIPIENTS`.

The change ID is the row ID plus the trigger's `_content_hash`. It is the dedupe key the spec asks for: the trigger fires once per distinct row content, and the ID is returned in every run's output.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Sheets, Updated Spreadsheet Row (`google-sheets`, `updated_row_only`). Its params are `spreadsheet` (= `SPREADSHEET_ID`) and `worksheet` (= `WORKSHEET_ID`). Leave the optional `dedupe_column` empty so it watches every column. Its `authentication_id` is the user's Google Sheets connection.
2. **Connections** (each alias in the code is the app's slug):
   - `microsoft-outlook`: the user's Outlook connection, for the mailbox the alerts are sent from.
   - Google Sheets is used only by the trigger, through its `authentication_id`. It has no alias in the code.
3. **Constants:**
   - `SPREADSHEET_ID`: the long ID in the sheet's URL. It must match the trigger's `spreadsheet` param, and it also builds the row link.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `VENDOR_COLUMN`, `TITLE_COLUMN`, `SUMMARY_COLUMN`, `DETAILS_COLUMN`, `ALERT_COLUMN`, `RECIPIENTS_COLUMN`: column keys such as `COL$A`, not header names. Map the user's headers to their column letters.
   - `ALERT_VALUES`: the flag values that count as an alert.
   - `DEFAULT_RECIPIENTS`: the crisis team inbox(es), used when a row has no recipients.
   - `EXCERPT_LENGTH`: how much of the details column to quote. Defaults to 500.
4. Test with the steps below, then publish and wait until the trigger is `active`.

## Ask the user

- Which sheet and tab is the vendor tracker? Which columns hold the vendor, title, summary, details, alert flag and (optionally) recipients?
- Which value marks a row as an alert? If it isn't one of `ALERT_VALUES`, change that list.
- Who should get alerts by default? Should rows be able to name their own recipients?
- Which Outlook account should send them? If they have no Outlook connection, they need to connect one before the alert path can run.

## Test

Run two draft test runs (`run_workflow_draft` in Zapier MCP) before publishing, using the shape of the trigger's sample record.

1. Skip path, which was run. No email is sent:

```json
{
  "id": 3,
  "row": 3,
  "_content_hash": "f102399b3b90913dd6e32adee09e13a8",
  "COL$A": "Beta Supplies",
  "COL$B": "Routine price list update",
  "COL$C": "Q4 price list received",
  "COL$D": "No action needed.",
  "COL$E": "No"
}
```

Expect `{ "skipped": true, "reason": "not-an-alert-row" }` and no operations.

2. Put the sender's own address in the recipients column so the email goes only to them:

```json
{
  "id": 2,
  "row": 2,
  "_content_hash": "26ab499f25f929e6843f761a314fbf08",
  "COL$A": "Acme Logistics",
  "COL$B": "Warehouse outage delays shipments",
  "COL$C": "Primary warehouse offline; 48h delay expected",
  "COL$D": "Power failure at the Newark site. Vendor estimates restoration by Friday.",
  "COL$E": "Yes",
  "COL$F": "you@example.com"
}
```

Check that one email arrives in that inbox. Its subject should be `[Vendor alert] Acme Logistics: Warehouse outage delays shipments`, it should be plain text, and the link in the body should open row 2 of the sheet.

## Customize

- **Severity and timestamps:** surface only high-severity text, or reformat timestamps, before the email is built. This is plain code between the filter and the send step.
- **Triage task:** also create a task in the team's project tool (Asana, Jira, Trello…) for each alert, so it gets formal triage.

## Notes

- The trigger fires only on edits to existing rows. A row that is added already flagged won't alert until it is edited. Use `updated_row_notify_hook` (New or Updated Spreadsheet Row) if new rows should alert too.
- Google Sheets triggers poll, so "real time" means within the account's polling interval.
- There is one email per qualifying row update. Editing an already-flagged row again sends another alert, because its content hash changes.
- Never commit a real spreadsheet ID or email address.
