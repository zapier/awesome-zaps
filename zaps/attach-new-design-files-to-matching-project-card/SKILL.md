---
name: attach-new-design-files-to-matching-project-card
description: Build a Zap on Zapier that watches a Dropbox folder and attaches each new design file to the Trello card whose name matches the filename exactly. Use when a design or CAD team drops files into a shared Dropbox folder and wants them on the matching Trello project card for review and handoff without manual uploads.
license: MIT
metadata:
  author: zapier
  summary: "When a design file lands in your shared Dropbox folder, it is attached to the Trello card with the same name, so reviewers find it on the card."
  apps: "Dropbox, Trello"
  category: "Design"
  job: "Cad technical design"
  source: "https://zapier.com/automations/design/cad-technical-design/design-file-management/attach-new-design-files-to-matching-project-card"
---

# Attach new design files to matching project card

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/attach-new-design-files-to-matching-project-card. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** Dropbox, New File in Folder (`dropbox`, `new_file`), on the folder you choose. Each new file in that folder starts a run, with its name and contents.
2. **Trello, Find Card:** searches the board you choose for cards that contain the filename. If no card has exactly that name, the run stops and attaches nothing.
3. **Trello, Add Attachment to Card:** attaches the full file (not a link) to the matching card. A file whose name matches no card changes nothing.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                   | Where                                                                     | What goes there                                                                                   |
| ------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `REPLACE_DROPBOX_FOLDER`  | `triggers/new-file.ts`, `params.directory`; `config.ts`, `DROPBOX_FOLDER` | The Dropbox folder that holds the design files, such as `/Design/CAD`. Set both to the same path. |
| `REPLACE_TRELLO_BOARD_ID` | `config.ts`, `TRELLO_BOARD_ID`                                            | The Trello board that holds the project cards.                                                    |

Also confirm with them that card names match the design filenames exactly, including the extension. A card with a different name is never matched.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `trello` (the account that can see the board) and `dropbox` (the account that owns the design folder, used by the trigger) to the user's connections. Neither needs another app.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-file.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test (`run_workflow_draft` in Zapier MCP) before publishing. Use a test file in the watched folder whose name matches a test card on the board:

```json
{
  "filename": "[install-test] bracket-v2.dwg",
  "file": "<the file the Dropbox trigger delivers>"
}
```

Check that the test card now has the file attached, and that a file whose name matches no card leaves every card unchanged. If run-status tools aren't available, check the result in Trello directly. Then publish, confirm the trigger is active, and ask the user to delete the test file and the test card, not the agent.

## Notes

- To create a card when no match is found instead of skipping, or to move the card to a review list after the attachment is added, add a step after the attachment.
- Trello's keyword search returns up to 50 cards by default. If the board has more cards matching the filename than that, an exact match can be missed.
- If two cards share the exact same name, the first one returned is used.
