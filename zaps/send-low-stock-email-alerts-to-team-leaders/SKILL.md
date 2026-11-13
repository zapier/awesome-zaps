---
name: send-low-stock-email-alerts-to-team-leaders
description: Build a Zap on Zapier that emails a branch's team leaders when a row in a stock spreadsheet shows stock below that branch's minimum. Use when a retail or store operation tracks branch stock in a Google Sheet and wants team leaders alerted as soon as a count drops under its threshold.
license: MIT
metadata:
  author: zapier
  summary: "When a branch's stock count in your inventory sheet drops below its minimum, the branch's team leaders get an email with the product and the count."
  apps: "Google Sheets, Gmail"
  category: "Business Owners"
  job: "Retail operations"
  source: "https://zapier.com/automations/business-owners/retail-operations/inventory-replenishment/send-low-stock-email-alerts-to-team-leaders"
---

# Send low stock email alerts to team leaders

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-low-stock-email-alerts-to-team-leaders. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a row is added or changed in the inventory spreadsheet's worksheet (`google-sheets`, `updated_row_notify_hook`, "New or Updated Spreadsheet Row").
2. **Code** reads the row's product, branch and stock columns. If the branch has no entry in `BRANCH_LEADERS`, or the stock is blank or not below that branch's threshold, the run stops and sends nothing.
3. **Gmail** sends one email to the branch's team leader addresses. The subject names the branch and product; the body gives the stock count and the minimum.

The Zap only sends email. It never edits the spreadsheet.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                     | Where                                                | What goes there                                                                   |
| --------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| `REPLACE_SPREADSHEET_ID`    | `triggers/updated-row-notify-hook.ts`, `spreadsheet` | The inventory spreadsheet that holds the stock counts                             |
| `REPLACE_BRANCH_ID`         | `workflow.ts`, `BRANCH_LEADERS` key                  | One entry per branch: that branch's identifier as it appears in the branch column |
| `REPLACE_TEAM_LEADER_EMAIL` | `workflow.ts`, `BRANCH_LEADERS` `emails`             | The team leaders' email addresses for that branch                                 |

Also review the defaults with them: the column letters in `config.ts` (`PRODUCT_COLUMN`, `BRANCH_COLUMN`, `STOCK_COLUMN`, set to `COL$A` to `COL$C`; map the user's headers to their letters), the `threshold` of `5` in each branch entry, and `worksheet` `"0"` in the trigger (the first tab).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` (the account that owns the inventory sheet) and `gmail` (the account that sends the alerts) to the user's connections. The trigger and the workflow use `google-sheets`.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-row-notify-hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it as draft test runs with the two sample rows below. Use a branch that is in `BRANCH_LEADERS` and send its team leaders' emails to the user's own address for the test, so no real team is emailed.

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

Confirm the first run sends one email with the product, branch and count in it, and that the second run reaches its skip branch with no email. If run-status tools aren't available, check the result in Gmail directly. Then publish, confirm the trigger is active, and tell the user to delete the test rows and any test emails. The user deletes test data, not the agent.

## Notes

- The trigger fires on every change to a row, so a row that stays low and is edited again sends another email. There is no de-duplication.
- A branch identifier not in `BRANCH_LEADERS` is skipped without an alert. Add the branch to the list to start alerting on it.
- A blank or non-numeric stock count is skipped, not treated as zero.
- Thresholds live in the code, not in the sheet. Change them by editing `BRANCH_LEADERS` and republishing.
- To also post to a team chat or log alerts to a tracking sheet, add a step after the email.
- Keep real spreadsheet IDs and leader email addresses out of any shared copy of the code.
