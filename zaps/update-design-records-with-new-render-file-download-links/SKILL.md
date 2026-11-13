---
name: update-design-records-with-new-render-file-download-links
description: Build a Zap on Zapier that writes the share link of each new render into the matching design record in a Notion database, so teams can open the asset from the record. Use when design or CAD renders land in a Dropbox folder and the team tracks them in a Notion database by file name.
license: MIT
metadata:
  author: zapier
  summary: "When a new render lands in your Dropbox folder, its share link is written into the matching design record in Notion, so the team can open the file from there."
  apps: "Dropbox, Notion"
  category: "Design"
  job: "Cad technical design"
  source: "https://zapier.com/automations/design/cad-technical-design/design-file-management/update-design-records-with-new-render-file-download-links"
---

# Update design records with new render file download links

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-design-records-with-new-render-file-download-links. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new file appears in the render folder in Dropbox (`dropbox`, `new_file`, not recursive). The trigger also creates a public share link for the file.
2. **Notion** searches the design database for a record whose title equals the file name without its extension. If there is no match, the run stops and writes nothing, and the file name is returned for manual review.
3. **Notion** writes the share link into the record's download URL property.

The Zap never creates a record.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                         | Where                               | What goes there                                                                                          |
| ------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `REPLACE_RENDER_FOLDER`         | `triggers/new-file.ts`, `directory` | The Dropbox folder that holds the renders, as a path from the Dropbox root, such as `/Renders`           |
| `REPLACE_NOTION_DATA_SOURCE_ID` | `config.ts`                         | The Notion database (data source) that holds the design records; look it up from the name the user gives |

Also review the defaults with them: `NOTION_TITLE_PROPERTY` (`"Name"`, the title property on the design records) and `NOTION_DOWNLOAD_URL_PROPERTY` (`"Download URL"`, the URL property that receives the link; create it in the database first).

Confirm that each design record's title equals the file name without its extension, since the workflow matches on that. If the team names records differently, change the match in `workflow.ts` before building.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `dropbox` (the account that can see the render folder) and `notion` (the workspace that holds the design database) to the user's connections. The trigger uses `dropbox`.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-file.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's parameters from its `params`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with a design record whose title matches the sample's file name. Create that record yourself and name it `[install-test] bracket-v3.step`:

```json
{
  "file_name": "[install-test] bracket-v3.step.pdf",
  "path": "/Renders/[install-test] bracket-v3.step.pdf",
  "share_link": "https://www.dropbox.com/scl/fi/EXAMPLE/bracket-v3.pdf?dl=0"
}
```

Check that the matching record's download URL property holds the sample link. If run-status tools aren't available, check the record in Notion directly. Then ask the user to delete the test record, since the agent does not delete test data. Publish only after the test passes, and confirm the trigger is active.

## Notes

- Matching uses the file name without its extension, against the title property. If two records share a title, the first match is used.
- To continue only for final renders, add a filter step for names containing a suffix such as `_final`, or for a set of extensions.
- For files whose trigger returns no share link, add a Dropbox action before the write that creates one.
- Notion's native "Update Data Source Item" action only appends page body content, so the workflow sets the URL property with a direct Notion API request, which needs the Notion connection.
- Keep a real Notion data source ID or Dropbox folder path out of any shared copy of this zap.
