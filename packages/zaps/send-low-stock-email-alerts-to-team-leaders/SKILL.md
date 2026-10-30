---
name: send-low-stock-email-alerts-to-team-leaders
description: Build a Zapier Next Gen Zap that emails a branch's team leaders when a row in a stock spreadsheet shows stock below that branch's minimum. Use when a retail or store operation tracks branch stock in a Google Sheet and wants team leaders alerted as soon as a count drops under its threshold.
metadata:
  author: zapier
  summary: "When a branch's stock count in your inventory sheet drops below its minimum, the branch's team leaders get an email with the product and the count."
  apps: "Google Sheets, Gmail"
  category: "Business Owners"
  job: "Retail operations"
  source: "https://zapier.com/automations/business-owners/retail-operations/inventory-replenishment/send-low-stock-email-alerts-to-team-leaders"
---

# Send low stock email alerts to team leaders

## What it does

1. **Trigger:** a row is added or changed in the inventory spreadsheet's worksheet (Google Sheets, New or Updated Spreadsheet Row).
2. **Code** reads the row's product, branch and stock columns. If the branch has no entry in `BRANCH_LEADERS`, or the stock is blank or not below that branch's threshold, the run stops and sends nothing.
3. **Gmail** sends one email to the branch's team leader addresses. The subject names the branch and product; the body gives the stock count and the minimum.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Sheets, `google-sheets` / `updated_row_notify_hook` ("New or Updated Spreadsheet Row"). Params: `spreadsheet` = `YOUR_SPREADSHEET_ID`, `worksheet` = `"0"` (the first tab). Leave `dedupe_column` unset so every row change is seen.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the Google Sheets connection for the account that owns the inventory sheet.
   - `gmail`: the Gmail connection that should send the alerts.
3. **Constants** (at the top of `workflow.ts`):
   - `PRODUCT_COLUMN`, `BRANCH_COLUMN`, `STOCK_COLUMN`: column keys such as `COL$A`, not header names. Map the user's headers to their column letters.
   - `BRANCH_LEADERS`: one entry per branch, keyed by the identifier in the branch column, with the leaders' email addresses (`emails`) and the minimum stock count (`threshold`). The example entry uses placeholders.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the spreadsheet link to confirm the trigger is pointed at the right tab.

## Ask the user

- Which spreadsheet and tab hold the stock counts? Which columns hold the product title, branch identifier and stock count?
- What is each branch's identifier, its team leaders' email addresses, and its minimum stock count?
- Should the alert go to one shared list for every branch, or does each branch have its own list?

## Test

Run these samples as draft test runs (`run_workflow_draft` in Zapier MCP) before publishing, with a test row already in the sheet:

Below threshold (should send one email):

```json
{
  "id": 2,
  "row": 2,
  "COL$A": "Test Widget A",
  "COL$B": "B-100",
  "COL$C": "3",
  "_content_hash": "fbb7dd9dd40a2d307189b8aab48cea80"
}
```

At or above threshold (should send nothing; the run output reads `skipped: true, reason: not-below-threshold`):

```json
{
  "id": 3,
  "row": 3,
  "COL$A": "Test Widget B",
  "COL$B": "B-200",
  "COL$C": "50",
  "_content_hash": "55a0a00e7fac2a41b70a4c5baeb16972"
}
```

Confirm the first run sends one email to the team leader list with the product, branch and count in it, and that the second run reaches its skip branch with no email. Then tell the user to delete the test rows and any test emails if they were real data.

## Customize

- **Add a Slack or team chat notification** in parallel for on-call store managers.
- **Log alerts** to a tracking worksheet or task list for audit and follow-up.

## Notes

- The trigger fires on every change to a row, so a row that stays low and is edited again sends another email. There is no de-duplication.
- A branch identifier not in `BRANCH_LEADERS` is skipped without an alert. Add the branch to the list to start alerting on it.
- A blank or non-numeric stock count is skipped, not treated as zero.
- Thresholds live in the code, not in the sheet. Change them by editing `BRANCH_LEADERS` and republishing.
- Never commit a real spreadsheet ID or leader email address. Anyone who can read the sheet can see the thresholds and who gets alerted.
