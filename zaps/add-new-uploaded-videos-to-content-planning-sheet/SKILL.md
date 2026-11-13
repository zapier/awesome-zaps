---
name: add-new-uploaded-videos-to-content-planning-sheet
description: Build a Zap on Zapier that logs each new video dropped into a staging folder as a row in a content planning sheet, with its file name, upload time and link. Use when a marketing or content team uploads social videos to a shared folder and wants them listed in a planning sheet for scheduling and approval without manual entry.
license: MIT
metadata:
  author: zapier
  summary: "When a video lands in your staging folder, it's added as a row in your content planning sheet, with its name, upload time and link, so the team can schedule and approve it."
  apps: "Google Drive, Google Sheets"
  category: "Marketing"
  job: "Content marketing"
  source: "https://zapier.com/automations/marketing/content-marketing/content-calendar-management/add-new-uploaded-videos-to-content-planning-sheet"
---

# Add new uploaded videos to content planning sheet

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/add-new-uploaded-videos-to-content-planning-sheet. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new file appears in the staging folder in Google Drive (`google-drive`, `file_in_folder_v2`). Subfolders are not searched.
2. **Filter:** the file continues only if its MIME type starts with `video/`. Anything else stops the run and writes nothing.
3. **Google Sheets** looks for a row whose title column already holds the file name. If one exists, the run stops, so a file is never logged twice.
4. **Google Sheets** creates a row: the file name in the title column, the upload time in the date column, and the file link in the asset location column.

The Zap only adds rows to the sheet. It never changes or moves the file in Drive.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting             | Where                                                     | What goes there                                                                                       |
| ------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `STAGING_FOLDER_ID` | `config.ts`, and `folder` in `triggers/file-in-folder.ts` | The Google Drive folder that new uploads land in. Look it up with the user's Google Drive connection. |
| `SPREADSHEET_ID`    | `config.ts`                                               | The content planning sheet. Look it up with the user's Google Sheets connection.                      |

Also review these defaults with them: `TITLE_COLUMN`, `UPLOADED_AT_COLUMN` and `FILE_LINK_COLUMN` (column keys such as `COL$A`; map the user's headers to their column letters, and the title column is the one matched against file names), `WORKSHEET_ID` (`"0"` is the first tab), and `MIME_PREFIX` (`"video/"`, so videos only).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` to the user's Google Sheets connection, for the account that owns the planning sheet. `google-drive` is used by the trigger, so bind it to the user's Google Drive connection for the account that owns the staging folder. No other app needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/file-in-folder.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's `folder` to the same answer as `STAGING_FOLDER_ID`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. The file name is a stand-in that matches no row in the sheet:

```json
{
  "name": "[install-test] sample-clip.mp4",
  "mimeType": "video/mp4",
  "createdTime": "2026-10-29T10:15:00Z",
  "webViewLink": "https://drive.google.com/file/d/0000000000000000000/view"
}
```

Check that one new row appears in the planning sheet, with the file name, upload time and link in the right columns. Then run the same sample again and check that no second row is added. If run-status tools aren't available, check the result in Google Sheets directly. Ask the user to delete the test rows, since the agent does not delete test data.

Then publish, wait until the trigger is active, and confirm it in the editor.

## Notes

- Matching is by file name. Two different videos with the same name are treated as one, and only the first is logged.
- Google Sheets may show the upload time in the sheet's own format and time zone.
- The filter runs before any Sheets call, so non-video uploads cost nothing.
- To create an approval task for each new asset, add a step after the row is added. To log only files whose names match a campaign pattern, add a check next to the MIME check.
- Never commit a real folder ID, spreadsheet ID or webhook URL to a shared copy of this skill.
