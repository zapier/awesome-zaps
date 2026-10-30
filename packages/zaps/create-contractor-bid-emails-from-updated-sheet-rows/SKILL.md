---
name: create-contractor-bid-emails-from-updated-sheet-rows
description: Build a Zapier Next Gen Zap that, when a bid request row in a project sheet is updated, creates a draft email to the contractor with the project details and marks the row as drafted so it is not drafted twice. Use when a construction or renovation business tracks bid requests in a Google Sheet and wants contractor bid emails drafted for review, not sent automatically.
metadata:
  author: zapier
  summary: "When a bid request row is updated, a draft bid email to the contractor is created for you to review, and the row is marked so it is not drafted twice."
  apps: "Google Sheets, Gmail"
  category: "Business Owners"
  job: "Construction operations"
  source: "https://zapier.com/automations/business-owners/construction-operations/project-bid-management/create-contractor-bid-emails-from-updated-sheet-rows"
---

# Create contractor bid emails from updated sheet rows

## What it does

1. **Trigger:** an existing row in the tracker worksheet is updated (Google Sheets, Updated Spreadsheet Row). New rows do not trigger it.
2. **Filter:** the run stops if the row has no contractor email, or if its Drafted column already says `Yes`. The second check is what stops the row's own update from drafting it again.
3. **Gmail** creates a draft (not sent) to the contractor's email. The subject is the project reference and location. The body has the project reference, location, details, description and a billing notice.
4. **Google Sheets** updates the same row: Drafted becomes `Yes` and Drafted At gets the time.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Sheets, `updated_row_only` (Updated Spreadsheet Row). Set `spreadsheet` to the tracker's spreadsheet ID and `worksheet` to `"0"` (the first tab). Those two values live in the trigger config, not the file, so set them to match `SPREADSHEET_ID` and `WORKSHEET_ID`.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the Google Sheets connection for the account that owns the tracker.
   - `gmail`: the Gmail connection that will hold the drafts.
3. **Constants:**
   - `SPREADSHEET_ID`: the long ID in the sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `CONTRACTOR_EMAIL_COLUMN`, `PROJECT_REFERENCE_COLUMN`, `LOCATION_COLUMN`, `PROJECT_DETAILS_COLUMN`, `DESCRIPTION_COLUMN`, `DRAFTED_COLUMN`, `DRAFTED_AT_COLUMN`: column keys such as `COL$A`, not header names. Map the user's headers to their column letters. The test sheet used A to G in that order.
   - `DRAFTED_VALUE`: what the drafted column holds once a draft exists. Defaults to `"Yes"`.
   - `BILLING_NOTICE`: the text added to the end of every draft.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user where to see the drafts.

## Ask the user

- Which sheet and tab hold bid requests, and which columns hold the contractor email, project reference, location, project details, description, drafted flag and drafted-at time? Add the drafted columns if they are missing.
- What billing notice should appear in every draft?
- Should the drafts come from the connected Gmail account? Gmail only lets you send from that account or its aliases, so a separate sender address needs an alias set up in Gmail.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. It is the payload the Updated Spreadsheet Row trigger returned for a test row, and the contractor address is the connected Gmail account so nothing leaves the account:

```json
{
  "id": 2,
  "row": 2,
  "COL$A": "you@example.com",
  "COL$B": "[install-test] BID-1001",
  "COL$C": "Brooklyn, NY 11215",
  "COL$D": "Kitchen gut renovation, about 2 weeks",
  "COL$E": "[install-test] Demolition, new cabinets and countertop install. Please send your bid.",
  "_content_hash": "2e8b284be27bd3338ed3e0308d916839"
}
```

Confirm that:

- the run completed with no failed step;
- the Gmail drafts folder has one new draft, addressed to the contractor, with the subject `<project reference> - <location>` and the details and billing notice in the body. It must not be sent;
- row 2 now has Drafted `Yes` and a time in Drafted At.

Then delete the test draft and clear the test row, or tell the user to, if they are real data.

## Customize

- **Send instead of draft:** swap Gmail Create Draft for Send Email to send requests immediately instead of queuing.
- **Add a CC:** add a coordinator's address to the draft, or include a priority tag for high-value projects.

## Notes

- The trigger fires on any update to a row, so the drafted-column check in the filter is what prevents repeat drafts. Do not remove it.
- If two rows have the same contractor, each gets its own draft.
- Drafts are created, never sent. Coordinators review them in Gmail before sending.
- Never commit a real spreadsheet ID or contractor address.
