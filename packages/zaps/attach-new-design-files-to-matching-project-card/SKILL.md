---
name: attach-new-design-files-to-matching-project-card
description: Build a Zapier Next Gen Zap that watches a Dropbox folder and attaches each new design file to the Trello card whose name matches the filename exactly. Use when a design or CAD team drops files into a shared Dropbox folder and wants them on the matching Trello project card for review and handoff without manual uploads.
metadata:
  author: zapier
  summary: "When a design file lands in your shared Dropbox folder, it is attached to the Trello card with the same name, so reviewers find it on the card."
  apps: "Dropbox, Trello"
  category: "Design"
  job: "Cad technical design"
  source: "https://zapier.com/automations/design/cad-technical-design/design-file-management/attach-new-design-files-to-matching-project-card"
---

# Attach new design files to matching project card

## What it does

1. **Trigger:** Dropbox, New File in Folder, on the folder you choose. Each new file in that folder starts a run, with its name and contents.
2. **Trello, Find Card:** searches the board you choose for cards that contain the filename. If no card has exactly that name, the run stops and attaches nothing.
3. **Trello, Add Attachment to Card:** attaches the full file (not a link) to the matching card.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top.

1. **Trigger:** Dropbox, New File in Folder (`dropbox`, `new_file`, version 3.11.0). It needs a Dropbox connection, so set its `authentication_id` to that connection's ID.
2. **Connections** (each alias in the code is the app's slug):
   - `dropbox`: the Dropbox connection for the account that owns the design folder.
   - `trello`: the Trello connection for the account that can see the board.
3. **Constants:**
   - `DROPBOX_FOLDER`: the folder path to watch, such as `/Design/CAD`. Also set `params.directory` on the trigger to the same path.
   - `TRELLO_BOARD_ID`: the board's ID, from its URL.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the trigger's webhook details if any are shown.

## Ask the user

- Which Dropbox folder holds the design files?
- Which Trello board holds the project cards, and do card names match the design filenames exactly (including the extension)?
- Which Dropbox and Trello accounts should be connected? Use the account that owns the folder and the one that can see the board.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a test file in the watched folder whose name matches a test card on the board:

```json
{
  "filename": "[install-test] bracket-v2.dwg",
  "file": "<the file the Dropbox trigger delivers>"
}
```

Check that the test card now has the file attached, and that a file whose name matches no card leaves every card unchanged. Then delete the test file and the test card if they are yours.

## Customize

- **Create a new card** when no match is found instead of skipping.
- **Tag or move the card** to a review list after the attachment is added.

## Notes

- Trello's keyword search returns up to 50 cards by default. If the board has more cards matching the filename than that, an exact match can be missed.
- If two cards share the exact same name, the first one returned is used.
