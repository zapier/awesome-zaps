---
name: send-requested-creative-files-to-requestor-same-day
description: Build a Zap on Zapier that emails the finished creative and its file link to the requestor, with the design owner on CC, as soon as a design request row in a Google Sheets tracker is marked Completed. Use when a design or creative team keeps requests in a sheet and wants finished files delivered without manual emails.
license: MIT
metadata:
  author: zapier
  summary: "When a design request is marked Completed in your tracker sheet, the requestor gets an email with the finished files, and the design owner is copied."
  apps: "Google Sheets, Gmail"
  category: "Design"
  job: "Creative operations"
  source: "https://zapier.com/automations/design/creative-operations/design-handoff-management/send-requested-creative-files-to-requestor-same-day"
---

# Send requested creative files to requestor same day

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-requested-creative-files-to-requestor-same-day. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a row in the request sheet is updated (`google-sheets`, `updated_row_only`).
2. **Filter:** if the status column is not exactly `Completed`, the run stops and sends nothing.
3. **Gmail** sends one email to the requestor's address from the request row, CC'd to the design owner, with the request's subject, the message text and a `Files:` line holding the file link.

Only a row whose status is exactly `Completed` sends an email.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                      | Where                                           | What goes there                                           |
| ---------------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| `REPLACE_SPREADSHEET_ID`     | `config.ts`, and `triggers/updated-row-only.ts` | The sheet that holds the design requests                  |
| `REPLACE_DESIGN_OWNER_EMAIL` | `workflow.ts`, `CC_ADDRESSES`                   | The design owner's email address, copied on each delivery |

Also review the defaults with them: `WORKSHEET_ID` (`"0"` is the first tab), the column keys `REQUESTOR_EMAIL_COLUMN` (`COL$A`), `SUBJECT_COLUMN` (`COL$B`), `MESSAGE_COLUMN` (`COL$C`), `FILE_LINK_COLUMN` (`COL$D`) and `STATUS_COLUMN` (`COL$E`), which must be mapped from the sheet's headers to their column letters, and `COMPLETED_VALUE` (`"Completed"`, matched exactly after trimming spaces).

Which Gmail account sends? It must be a connected Gmail account, not a shared address (see Notes).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` (the Gmail account that sends the emails) and `google-sheets` (the account that owns the request sheet) to the user's connections.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-row-only.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run these as draft test runs (`run_workflow_draft`) before publishing. Use a requestor address you control, since the email goes there.

A completed row, which should send:

```json
{
  "COL$A": "you@example.com",
  "COL$B": "[install-test] Final logo pack",
  "COL$C": "Test handoff row. Files are ready.",
  "COL$D": "https://drive.google.com/drive/folders/your-test-folder",
  "COL$E": "Completed",
  "row": 2,
  "id": 2
}
```

Check that one email arrives at the requestor address with the subject, the message and the `Files:` link in the body, and that the CC address gets a copy. The same row with `"COL$E": "Pending"` should skip: the run returns `status-not-completed` and no email is sent.

If run-status tools aren't available, check the result in Gmail directly. The user deletes the test row and any test email, not the agent.

## Notes

- Gmail sends from the connected account. A shared marketing "from" address needs a send-as alias on that account; the workflow does not set `from`.
- The trigger fires on any update to a row. The status check is what stops non-completed rows, so only a change to `Completed` sends.
- Anyone who can edit the request sheet can cause an email by setting `Completed`. Keep edit access to the sheet limited.
- To attach the files instead of linking them, add a Formatter step before the Gmail step that turns the link into an attachment. To post to Slack when an email goes out, add a Slack message after the Gmail step.
- Don't commit a real spreadsheet ID or email address into this folder.
