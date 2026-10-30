---
name: send-contract-request-emails-to-assigned-advisors-today
description: Build a Zapier Next Gen Zap that emails the assigned advisor when a contract request row is added or updated in a Google Sheets tracker, with the requester copied and the request details in the body. Use when a legal or contracts team logs contract requests in a sheet and wants the reviewing advisor notified without polling.
metadata:
  author: zapier
  summary: "When a contract request lands or changes in your tracking sheet, the assigned advisor gets an email with the details, so review starts right away."
  apps: "Google Sheets, Microsoft Outlook"
  category: "Legal"
  job: "Contract management"
  source: "https://zapier.com/automations/legal/contract-management/contract-review/send-contract-request-emails-to-assigned-advisors-today"
---

# Send contract request emails to assigned advisors today

## What it does

1. **Trigger:** a row is added or updated in the configured worksheet (Google Sheets, New or Updated Spreadsheet Row).
2. **Check:** if the row has no advisor email, the run stops and sends nothing.
3. **Microsoft Outlook** sends one HTML email to the advisor. The requester or collaborator emails go in CC, the subject is built from organization, title and date, and the body carries the planner and request details.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top.

1. **Trigger:** Google Sheets, New or Updated Spreadsheet Row (`google-sheets`, `updated_row_notify_hook`). Use the user's Google Sheets connection as the trigger's authentication.
2. **Connections** (each alias in the code is the app's slug):
   - `microsoft-outlook`: the user's Outlook connection, the account the email is sent from.
3. **Constants:**
   - `SPREADSHEET_ID`: the long ID in the tracker's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `ADVISOR_EMAIL_FIELD`, `COLLABORATOR_EMAIL_FIELDS`, `ORGANIZATION_FIELD`, `TITLE_FIELD`, `DATE_FIELD`, `PLANNER_FIELD`, `REQUEST_DETAILS_FIELD`: the row keys for each value. Set them to the user's column headers, in the form the trigger returns them.
   - `SENDER_ADDRESS`: leave `""` to send from the connected Outlook account, or set a shared mailbox.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user where the trigger listens.

## Ask the user

- Which sheet and tab hold the contract requests?
- Which columns hold the advisor's email, the requester or collaborator emails, organization, title, date, planner and request details?
- Should the email come from a shared mailbox instead of the user's own Outlook address?
- Should rows be deduplicated? This zap does not do it (see Notes).

## Test

To test, use a sheet the user owns, with an `[install-test]` tab or row. Add a row with the advisor set to the Outlook account's own address, then:

- Confirm one email arrives at that address, with the subject built from organization, title and date.
- Confirm the body shows the planner and request details from the row.
- Confirm no other email was sent.

Then remove the test row, or tell the user to.

## Customize

- **Filter by request type or status:** add a Filter step so only some rows send. In the code, return early when the row does not match.
- **Team channel instead of email:** replace the Outlook step with a Slack or Teams post to a triage channel, for collective review.

## Notes

- The "dedupe" step in the spec is not built. The Google Sheets trigger has a `dedupe_column` option that limits triggers to changes in one column, which is the closest match. Repeat sends on the same row are possible.
- Google Sheets may show dates in the sheet's own format and time zone.
- The spec's email step uses Outlook. Gmail would work the same way with a different app key, but this zap does not substitute it.
- Never commit a real spreadsheet ID or email address in the constants.
