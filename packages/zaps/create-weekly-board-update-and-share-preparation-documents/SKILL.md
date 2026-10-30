---
name: create-weekly-board-update-and-share-preparation-documents
description: Build a Zapier Next Gen Zap that, every week, copies your board-update template into a dated document in OneDrive, creates an editable share link, and posts it as a monday.com update with a Friday deadline. Use when an executive or chief of staff prepares a weekly board update and wants the document and the team's deadline set up automatically.
metadata:
  author: zapier
  summary: "Every week, a fresh dated board-update document is made from your template, shared for editing, and posted to your team's monday.com item with a Friday deadline."
  apps: "Schedule by Zapier, OneDrive, monday.com"
  category: "Executives"
  job: "Reporting management"
  source: "https://zapier.com/automations/executives/reporting-management/cross-functional-report-aggregation/create-weekly-board-update-and-share-preparation-documents"
---

# Create weekly board update and share preparation documents

## What it does

1. **Trigger:** every week on the configured weekday and time (Schedule by Zapier).
2. **Compute dates** in plain code: the Monday of the run week and the Friday after it, with a deadline of "Friday <date> end of business".
3. **OneDrive** searches for an existing document named `Board update - week of <Monday>`. If none exists, it copies the template into the destination folder under that name.
4. **OneDrive** creates an editable share link for the document, keeping inherited permissions.
5. **monday.com** posts an update on the configured board item with the link and the deadline.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Schedule by Zapier, Every Week (`schedule`, `everyWeek`). It needs no connection, so its `authentication_id` is `null`. The reference build uses Monday at 9:00 AM.
2. **Connections** (each alias in the code is the app's slug):
   - `onedrive`: the Microsoft OneDrive connection for the account that owns the template and the destination folder.
   - `monday`: the monday.com connection for the account that owns the board item.
3. **Constants:**
   - `DESTINATION_FOLDER_ID`: the OneDrive folder ID where dated copies go.
   - `TEMPLATE_FILE_ID`: the OneDrive file ID of the weekly template.
   - `DOC_NAME_PREFIX`: the start of the document name. Defaults to `"Board update"`.
   - `BOARD_ITEM_ID`: the monday.com item ID that receives the update.

## Ask the user

- Which OneDrive folder should hold the dated copies, and which file is the template?
- Which monday.com board item should receive the update?
- What weekday and time should the run start? (The code does not change; it is set on the trigger.)
- Should the document name prefix be something other than `Board update`?

## Test

No test was run. To test before publishing, use `run_workflow_draft` with no input, once the OneDrive and monday.com connections are bound. Check that:

- A document named `Board update - week of <Monday>` exists in the destination folder, either newly copied from the template or the existing one.
- The share link opens for editing without sign-in.
- The monday.com item has a new update containing that link and the "Friday ... end of business" deadline.

Use a template copy and a test board item you control; the update is visible to everyone on the item.

## Customize

- **Post to a team channel** instead of a board item, or add an attachment list for additional resources.
- **Mention the assigned owners** of the board item in the update body. Not built: it needs the owners column read from monday.com, which requires a connection.

## Notes

- Dates are computed in UTC. Set a timezone override on the trigger if the week boundary matters.
- If a document with the same name already exists, the workflow reuses it and does not copy the template again.
- Confirm them on the first real run.
- Never commit a real folder ID, template ID or board item ID.
