---
name: send-contract-request-emails-to-assigned-advisors-today
description: Build a Zap on Zapier that emails the assigned advisor when a contract request row is added or updated in a Google Sheets tracker, with the requester copied and the request details in the body. Use when a legal or contracts team logs contract requests in a sheet and wants the reviewing advisor notified without polling.
license: MIT
metadata:
  author: zapier
  summary: "When a contract request lands or changes in your tracking sheet, the assigned advisor gets an email with the details, so review starts right away."
  apps: "Google Sheets, Microsoft Outlook"
  category: "Legal"
  job: "Contract management"
  source: "https://zapier.com/automations/legal/contract-management/contract-review/send-contract-request-emails-to-assigned-advisors-today"
---

# Send contract request emails to assigned advisors today

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-contract-request-emails-to-assigned-advisors-today. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a row is added or updated in the tracker sheet (`google-sheets`, `updated_row_notify_hook`, New or Updated Spreadsheet Row).
2. **Check:** if the row has no advisor email, the run stops and sends nothing.
3. **Microsoft Outlook** sends one HTML email to the advisor. The requester's email goes in CC, the subject is built from organization, title and date, and the body carries the planner and request details.

The Zap only sends email. It never changes the sheet, and it never sends to anyone other than the advisor and the requester.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting          | What goes there                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| `SPREADSHEET_ID` | The tracker sheet the contract requests land in. Look it up with the user's Google Sheets connection, by its name |

Also review the defaults with them:

- `WORKSHEET_ID`: the tab that holds the requests. `"0"` is the first tab.
- `ADVISOR_EMAIL_FIELD`, `ORGANIZATION_FIELD`, `TITLE_FIELD`, `DATE_FIELD`, `PLANNER_FIELD` and `REQUEST_DETAILS_FIELD` in `config.ts`, and `COLLABORATOR_EMAIL_FIELDS` in `workflow.ts` (the requester's email): each must match the user's column header for that value.
- `SENDER_ADDRESS`: leave `""` to send from the user's own Outlook account, or set a shared mailbox.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` (the account that owns the tracker) and `microsoft-outlook` (the account the email is sent from) to the user's connections.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-row-notify-hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, with the trigger watching the spreadsheet and worksheet in `SPREADSHEET_ID` and `WORKSHEET_ID`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with a sample row in a tab the user controls. Use the advisor's address set to the user's own Outlook address, so the test email lands with them:

```json
{
  "advisor_email": "your-outlook-address@example.com",
  "requester_email": "",
  "organization": "[install-test] Example Co",
  "title": "[install-test] NDA review",
  "date": "2026-11-13",
  "planner": "Test planner",
  "request_details": "[install-test] Please review the attached NDA."
}
```

Check that one email arrives at that address, with the subject built from organization, title and date, and that the body shows the planner and request details. Check that no other email was sent. If run-status tools aren't available, check the result in Outlook directly. Then publish and confirm the trigger is active. Ask the user to delete the test row and the test email; the agent does not delete test data.

## Notes

- The Zap does not dedupe. The Google Sheets trigger's `dedupe_column` option limits runs to changes in one column, the closest match, but repeat sends on the same row are possible.
- Google Sheets may show dates in the sheet's own format and time zone.
- The Zap sends from Outlook only. Gmail would need a different app step.
- To send only some rows, add a Filter step that stops the run when the row doesn't match.
- To post to a team channel instead of emailing, replace the Outlook step with a Slack or Teams post.
- Never commit a real spreadsheet ID or email address in `config.ts`.
