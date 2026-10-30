---
name: save-new-build-artifacts-into-organized-release-folder
description: Use when build artifacts land in one Google Drive folder and release or engineering teams need each one copied into a release folder under a timestamped, reproducible name, without manual filing.
metadata:
  author: zapier
  summary: "When a new build artifact lands in your source folder, a timestamped copy is saved into your release folder, so teams can find reproducible files without filing them by hand."
  apps: "Google Drive"
  category: "Engineering"
  job: "Software delivery"
  source: "https://zapier.com/automations/engineering/software-delivery/release-management/save-new-build-artifacts-into-organized-release-folder"
---

# Save new build artifacts into organized release folder

## What it does

1. **Trigger:** a new file appears in your source folder (Google Drive, New File in Folder). Subfolders are not watched.
2. **Google Drive** copies that file into your release folder, named `<ISO timestamp> <original filename>`. Each run makes a new copy, so nothing is overwritten.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top.

1. **Trigger:** Google Drive, New File in Folder (`google-drive` / `file_in_folder_v2`). Set its Folder to `SOURCE_FOLDER_ID`, with Include Subfolders off and Include Deleted Files set to only non-deleted.
2. **Connections** (each alias in the code is the app's slug):
   - `google-drive`: the Google Drive connection for the account that owns both folders.
3. **Constants:**
   - `SOURCE_FOLDER_ID`: the Drive folder ID that receives new build artifacts. Use the same ID in the trigger's Folder.
   - `RELEASE_FOLDER_ID`: the Drive folder ID where the timestamped copies go.

## Ask the user

- Which Drive folder receives the build artifacts, and which folder should hold the release copies?
- Which Google Drive account should the connection use?

## Test

The sample input for a future test is a Drive file record from the source folder:

```json
{
  "id": "YOUR_TEST_FILE_ID",
  "title": "app-1.2.3.zip",
  "originalFilename": "app-1.2.3.zip"
}
```

Check that a copy appears in the release folder, named with the run's ISO timestamp followed by the original filename, and that the source file is unchanged.

## Customize

- **Share with a release group:** add an optional Google Drive step that sets sharing on the release folder for a release group.
- **Skip small files:** add a conditional step that ignores files below a size threshold.

## Notes

- Copy File has no description field, so the spec's file description is not set.
- The trigger payload has no separate build identifier, so the timestamp and original filename are the only parts of the name.
- Replace the placeholder folder IDs in `workflow.ts` and the trigger before use. Never commit real Drive folder IDs.
