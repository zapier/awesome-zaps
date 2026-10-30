---
name: add-new-uploaded-videos-to-content-planning-sheet
description: Build a Zapier Next Gen Zap that logs each new video dropped into a staging folder as a row in a content planning sheet, with its file name, upload time and link. Use when a marketing or content team uploads social videos to a shared folder and wants them listed in a planning sheet for scheduling and approval without manual entry.
metadata:
  author: zapier
  summary: "When a video lands in your staging folder, it's added as a row in your content planning sheet, with its name, upload time and link, so the team can schedule and approve it."
  apps: "Google Drive, Google Sheets"
  category: "Marketing"
  job: "Content marketing"
  source: "https://zapier.com/automations/marketing/content-marketing/content-calendar-management/add-new-uploaded-videos-to-content-planning-sheet"
---

# Add new uploaded videos to content planning sheet

## What it does

1. **Trigger:** a new file appears in the staging folder in Google Drive. Subfolders are not searched.
2. **Filter:** the file continues only if its MIME type starts with `video/`. Anything else stops the run and writes nothing.
3. **Google Sheets** looks for a row whose title column already holds the file name. If one exists, the run stops, so a file is never logged twice.
4. **Google Sheets** creates a row: the file name in the title column, the upload time in the date column, and the file link in the asset location column.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Drive, New File in Folder (`google-drive`, `file_in_folder_v2`). Set `folder` to the staging folder's ID, `includeSubfolders` to `false` and `includeDeleted` to `"false"`. Use the same ID for `STAGING_FOLDER_ID`.
2. **Connections** (each alias in the code is the app's slug):
   - `google-drive`: the user's Google Drive connection, for the account that owns the staging folder. The trigger uses it.
   - `google-sheets`: the user's Google Sheets connection, for the account that owns the planning sheet.
3. **Constants:**
   - `STAGING_FOLDER_ID`: the folder ID from the staging folder's Drive URL. Also set it as the trigger's `folder`.
   - `SPREADSHEET_ID`: the long ID in the planning sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `TITLE_COLUMN`, `UPLOADED_AT_COLUMN`, `FILE_LINK_COLUMN`: column keys such as `COL$A`, not header names. Map the user's headers to their column letters. `TITLE_COLUMN` is also the column matched against file names.
   - `MIME_PREFIX`: `"video/"` by default. Change it only if the team also wants other file types.
4. Test with the steps below, then publish, wait until the trigger is active, and confirm the trigger in the editor.

## Ask the user

- Which Drive folder is the staging folder, and which sheet and tab is the content planning sheet?
- Which columns hold the title, upload time and file link?
- Should the filter also accept other file types, or only videos? The default is videos only.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a video file in the staging folder, or a stand-in file with a name that does not match any row in the sheet:

```json
{
  "name": "[install-test] sample-clip.mp4",
  "mimeType": "video/mp4",
  "createdTime": "2026-10-29T10:15:00Z",
  "webViewLink": "https://drive.google.com/file/d/YOUR_FILE_ID/view"
}
```

Confirm that one new row appears in the planning sheet with the file name, upload time and link in the right columns. Then run the same sample again and confirm no second row is added. Delete the test row afterwards if it was not real data.

## Customize

- **Approval task:** create an approval task in your project tool for each new asset, after the row is added.
- **Naming filter:** only log files whose names match your campaign naming pattern, by adding a check next to the MIME check.

## Notes

- Matching is by file name. Two different videos with the same name are treated as one, and only the first is logged.
- Google Sheets may show the upload time in the sheet's own format and time zone.
- The filter runs before any Sheets call, so non-video uploads cost nothing.
- Never commit a real folder ID, spreadsheet ID or webhook URL to a shared copy of this skill.
