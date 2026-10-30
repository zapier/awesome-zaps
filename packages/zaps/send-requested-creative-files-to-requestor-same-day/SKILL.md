---
name: send-requested-creative-files-to-requestor-same-day
description: Build a Zapier Next Gen Zap that emails the finished creative and its file link to the requestor, with the design owner on CC, as soon as a design request row in a Google Sheets tracker is marked Completed. Use when a design or creative team keeps requests in a sheet and wants finished files delivered without manual emails.
metadata:
  author: zapier
  summary: "When a design request is marked Completed in your tracker sheet, the requestor gets an email with the finished files, and the design owner is copied."
  apps: "Google Sheets, Gmail"
  category: "Design"
  job: "Creative operations"
  source: "https://zapier.com/automations/design/creative-operations/design-handoff-management/send-requested-creative-files-to-requestor-same-day"
---

# Send requested creative files to requestor same day

## What it does

1. **Trigger:** a row in the request sheet is updated (Google Sheets, Updated Spreadsheet Row).
2. **Filter:** if the status column is not exactly `Completed`, the run stops and sends nothing.
3. **Gmail:** sends one email to the requestor's address from the request row, CC'd to the design owner, with the request's subject, the message text and a `Files:` line holding the file link.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Sheets, Updated Spreadsheet Row (`google-sheets`, action `updated_row_only`). Set its `spreadsheet` to the request sheet and `worksheet` to the tab, the same values as the constants. It uses the Google Sheets connection for the account that owns the sheet.
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the Gmail account that sends the emails.
3. **Constants:**
   - `SPREADSHEET_ID`: the long ID in the request sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `REQUESTOR_EMAIL_COLUMN`, `SUBJECT_COLUMN`, `MESSAGE_COLUMN`, `FILE_LINK_COLUMN`, `STATUS_COLUMN`: column keys such as `COL$A`, not header names. Map the sheet's headers to their column letters.
   - `COMPLETED_VALUE`: the status that means ready. Defaults to `"Completed"`. The match is exact after trimming spaces.
   - `CC_ADDRESSES`: the design owner(s) to copy. The default is the placeholder `YOUR_DESIGN_OWNER_EMAIL`.
4. Test with the steps below, then publish, confirm the trigger is active, and leave the workflow enabled.

## Ask the user

- Which sheet and tab hold the requests, and which columns hold the requestor's email, subject, message, file link and status?
- What status text means the files are ready? The default is `Completed`.
- Who should be CC'd? Replace the placeholder in `CC_ADDRESSES`.
- Which Gmail account sends? It must be a connected Gmail account; the workflow cannot send from a separate shared address (see Notes).

## Test

Run these as draft test runs (`run_workflow_draft` in Zapier MCP) before publishing. Use a requestor address you control, since the email goes there.

Completed row (sends):

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

Confirm one email arrives at the requestor address with the subject, the message and the `Files:` link in the body, and that the CC address gets a copy.

Same row with `"COL$E": "Pending"` (should skip): confirm the run returns `status-not-completed` and that no email is sent.

Then delete the test row, and delete any test email.

## Customize

- **Attach the files** instead of linking them: add a Formatter step that turns the link into an attachment before the Gmail step.
- **Post to Slack** when an email is sent: add a Slack message to the design channel after the Gmail step, so the team sees each delivery.

## Notes

- Gmail sends from the connected account. The original spec asks for a shared marketing "from" address; that needs a send-as alias on the connected account, and the workflow does not set `from`.
- The trigger fires on any update to a row. The status check is what stops non-completed rows, so only a change to `Completed` sends.
- Anyone who can edit the request sheet can cause an email by setting `Completed`. Keep edit access to the sheet limited.
- Never commit a real spreadsheet ID or email address into a shared copy of this file.
