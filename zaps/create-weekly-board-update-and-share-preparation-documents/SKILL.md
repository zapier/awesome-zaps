---
name: create-weekly-board-update-and-share-preparation-documents
description: Build a Zap on Zapier that, every week, copies your board-update template into a dated document in OneDrive, creates an editable share link, and posts it as a monday.com update with a Friday deadline. Use when an executive or chief of staff prepares a weekly board update and wants the document and the team's deadline set up automatically.
license: MIT
metadata:
  author: zapier
  summary: "Every week, a fresh dated board-update document is made from your template, shared for editing, and posted to your team's monday.com item with a Friday deadline."
  apps: "Schedule by Zapier, OneDrive, monday.com"
  category: "Executives"
  job: "Reporting management"
  source: "https://zapier.com/automations/executives/reporting-management/cross-functional-report-aggregation/create-weekly-board-update-and-share-preparation-documents"
---

# Create weekly board update and share preparation documents

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-weekly-board-update-and-share-preparation-documents. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** every week on the configured weekday and time (Schedule by Zapier).
2. **Compute dates** in plain code: the Monday of the run week and the Friday after it, with a deadline of "Friday <date> end of business".
3. **OneDrive** searches for an existing document named `Board update - week of <Monday>`. If none exists, it copies the template into the destination folder under that name.
4. **OneDrive** creates an editable share link for the document, keeping inherited permissions.
5. **monday.com** posts an update on the configured board item with the link and the deadline.

The Zap only creates the document and the update. It never edits the document's contents; the team adds their updates there.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                         | What goes there                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `REPLACE_DESTINATION_FOLDER_ID` | The OneDrive folder that holds the dated copies. Find it with the user's OneDrive connection.                |
| `REPLACE_TEMPLATE_FILE_ID`      | The weekly board-update template in OneDrive, copied each week. Find it with the user's OneDrive connection. |
| `REPLACE_BOARD_ITEM_ID`         | The monday.com item that receives the update. Find it with the user's monday.com connection.                 |

Also review the defaults with them:

- `DOC_NAME_PREFIX`: the start of the document name, `"Board update"` by default. The week-of date is appended.
- The weekday and time on the trigger, set in `triggers/every-week.ts`. The reference build runs Monday at 9:00 AM.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `onedrive` (the account that owns the template and the destination folder) and `monday` (the account that owns the board item) to the user's connections. Schedule by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/every-week.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with no input, using a template copy and a test board item the user controls, since the update is visible to everyone on the item:

- A document named `Board update - week of <Monday>` exists in the destination folder, either newly copied from the template or the existing one.
- The share link opens for editing without sign-in.
- The monday.com item has a new update containing that link and the "Friday ... end of business" deadline.

If run-status tools aren't available, check the result in OneDrive and monday.com directly. Then ask the user to delete the test document and the test update, not the agent. Publish only after the test passes, and confirm the trigger is active.

## Notes

- Dates are computed in UTC. Set a timezone override on the trigger if the week boundary matters.
- If a document with the same name already exists, the Zap reuses it and does not copy the template again.
- To post to a team channel instead of a board item, or to add an attachment list, change the last step. Mentioning the item's assigned owners needs the owners column read from monday.com, which the Zap does not do yet.
- Never commit a real folder ID, template ID or board item ID.
