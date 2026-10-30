---
name: update-design-records-with-new-render-file-download-links
description: Build a Zapier Next Gen Zap that writes the share link of each new render into the matching design record in a Notion database, so teams can open the asset from the record. Use when design or CAD renders land in a Dropbox folder and the team tracks them in a Notion database by file name.
metadata:
  author: zapier
  summary: "When a new render lands in your Dropbox folder, its share link is written into the matching design record in Notion, so the team can open the file from there."
  apps: "Dropbox, Notion"
  category: "Design"
  job: "Cad technical design"
  source: "https://zapier.com/automations/design/cad-technical-design/design-file-management/update-design-records-with-new-render-file-download-links"
---

# Update design records with new render file download links

## What it does

1. **Trigger:** a new file appears in your render folder in Dropbox (non-recursive). The trigger also creates a public share link for the file.
2. **Notion** searches your design database for a record whose title equals the file name without its extension. If there is no match, the run stops and writes nothing, and the file name is returned for manual review.
3. **Notion** writes the share link into the record's download URL property. Records are never created automatically.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Dropbox, New File in Folder (`dropbox`, action `new_file`). Set these trigger parameters:
   - `directory`: the render folder's path from your Dropbox root, such as `/Renders`.
   - `recursive`: `false`.
   - `include_file_contents`: `no`. Set it to `no` so large renders do not fail the run. The workflow does not read file contents.
   - `include_sharing_link`: `yes`, and `sharing_link_audience`: `public`. The share link arrives in the trigger's `share_link` field.
   - Trigger connection: your Dropbox connection, chosen when you build it. Leave `authentication_id` null until then.
2. **Connections** (each alias in the code is the app's slug):
   - `notion`: the Notion connection for the workspace that holds the design database.
3. **Constants:**
   - `NOTION_DATA_SOURCE_ID`: the ID of the design database's data source. Open the database in Notion and copy it from the database's settings, or ask Zapier for the data source ID.
   - `NOTION_TITLE_PROPERTY`: the title property of the design records, `"Name"` by default.
   - `NOTION_DOWNLOAD_URL_PROPERTY`: the URL property that receives the link, `"Download URL"` by default. Create this property in the database first.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the trigger's webhook details if any. The trigger needs no webhook; it watches the folder.

## Ask the user

- Which Dropbox folder holds the renders? Set it as the trigger's `directory`.
- Which Notion database is the design database, and what are its title and download-URL properties?
- Should a record's title equal the file name without its extension? The workflow assumes yes. If the team names records differently, change the match in `workflow.ts`.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, with a design record whose title matches the file name. Create the record yourself and name it `[install-test] ...`:

```json
{
  "file_name": "[install-test] bracket-v3.step.pdf",
  "path": "/Renders/[install-test] bracket-v3.step.pdf",
  "share_link": "https://www.dropbox.com/scl/fi/EXAMPLE/bracket-v3.pdf?dl=0"
}
```

Confirm that the matching record's download URL property holds the sample link. Then clear the test value from the record.

## Customize

- **Filter to final renders:** add a filter step so the workflow continues only for files whose name contains a suffix such as `_final`, or a set of extensions.
- **Create the share link automatically:** add a Dropbox action that creates a share link before writing it, for files whose trigger returns no link.

## Notes

- Matching uses the file name without its extension, against the title property. Two records with the same title: the first match is used.
- Notion's native "Update Data Source Item" action only appends page body content, so the workflow sets the URL property with a direct Notion API request instead. That request needs the Notion connection to authorize it.
- Do not commit a real Notion data source ID or Dropbox folder path to a shared copy of this file.
