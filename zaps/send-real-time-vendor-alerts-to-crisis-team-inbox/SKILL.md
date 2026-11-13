---
name: send-real-time-vendor-alerts-to-crisis-team-inbox
description: Build a Zap on Zapier that emails a plain-text alert from Microsoft Outlook whenever a row in a Google Sheets vendor tracker is updated and flagged as an alert, with the vendor, title, summary, a details excerpt and a link back to the row. Use when a crisis, PR or account team logs vendor incidents in a sheet and wants flagged ones in their inbox right away instead of watching the sheet.
license: MIT
metadata:
  author: zapier
  summary: "When a vendor row in your tracking sheet is flagged as an alert, your crisis team gets an email with the details and a link to the row."
  apps: "Google Sheets, Microsoft Outlook"
  category: "Executives"
  job: "Crisis incident management"
  source: "https://zapier.com/automations/executives/crisis-incident-management/crisis-communication-distribution/send-real-time-vendor-alerts-to-crisis-team-inbox"
---

# Send real-time vendor alerts to crisis team inbox

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-real-time-vendor-alerts-to-crisis-team-inbox. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a row in the tracker sheet is updated (`google-sheets`, `updated_row_only`). New rows don't fire it, only edits to existing rows.
2. **Filter (code):** the run continues only if the alert column holds `Yes`, `Y`, `True`, `X` or `Alert` (case doesn't matter). Any other value returns `skipped: not-an-alert-row`.
3. **Microsoft Outlook** (`microsoft-outlook`) sends one plain-text email:
   - **Subject:** `[Vendor alert] <vendor>: <title>`
   - **Body:** the vendor, title, summary, up to 500 characters of the details column, the row number, a link to the row and a change ID.
   - **Recipients:** the row's own recipients column if it has addresses (separated by commas or semicolons), otherwise the default crisis team inbox.

The change ID is the row ID plus the trigger's content hash, so each distinct row content is one alert. The Zap only sends email; it never edits the sheet.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting              | What goes there                                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `SPREADSHEET_ID`     | The vendor alert tracker sheet. Look up its ID from the sheet the user names, with their Google Sheets connection |
| `DEFAULT_RECIPIENTS` | The crisis team inbox address or addresses, for rows with no recipients of their own. Ask the user for these      |

Also review the defaults with them: `WORKSHEET_ID` (`"0"` is the first tab), the column letters in `config.ts` (`VENDOR_COLUMN` to `RECIPIENTS_COLUMN`; map their headers to letters, since the keys are columns, not header names), `ALERT_VALUES` in `workflow.ts` (the flag values that count as an alert) and `EXCERPT_LENGTH` (500).

Also ask which Outlook account should send the alerts. It needs a Microsoft Outlook connection before the alert path can run.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `microsoft-outlook` to the user's Outlook connection for the mailbox the alerts are sent from. The trigger's `google-sheets` connection is set in step 2.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-row-only.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. Set the trigger's `spreadsheet` to `SPREADSHEET_ID` and `worksheet` to `WORKSHEET_ID`, and leave its optional `dedupe_column` empty so it watches every column. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run two draft tests before publishing, using the shape of the trigger's sample record, with the recipients set to an inbox the user controls.

1. Skip path: no email is sent.

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

2. Alert path: put the sender's own address in the recipients column so the email goes only to them.

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

Check that one email arrives in that inbox. Its subject should be `[Vendor alert] Acme Logistics: Warehouse outage delays shipments`, it should be plain text, and the link in the body should open row 2 of the sheet. If run-status tools aren't available, check the result in Outlook directly. Then publish, confirm the trigger is active, and ask the user to delete the test email. The user deletes test data, not the agent.

## Notes

- The trigger fires only on edits to existing rows. A row added already flagged won't alert until it is edited. To alert on new rows too, switch the trigger to New or Updated Spreadsheet Row.
- Google Sheets triggers poll, so "real time" means within the account's polling interval.
- There is one email per qualifying row update. Editing an already-flagged row again sends another alert, because its content hash changes.
- To add severity filtering, reformatted timestamps or a task in a project tool, add steps between the filter and the send.
- Never commit a real spreadsheet ID or email address.
