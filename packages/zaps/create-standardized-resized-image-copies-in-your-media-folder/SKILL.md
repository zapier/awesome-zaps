---
name: create-standardized-resized-image-copies-in-your-media-folder
description: Build a Zapier Next Gen Zap that runs hourly, finds new image files in a source Google Drive folder, and writes a copy of each into a destination folder with a size-specific filename, such as photo-1080x1080.jpg. Use when a content team keeps originals in one Drive folder and needs standardized, size-named copies ready in another without manual renaming.
metadata:
  author: zapier
  summary: "Each hour, new images in your source folder get a size-named copy in your media folder, so content teams find standardized files without renaming anything."
  apps: "Schedule by Zapier, Google Drive"
  category: "Design"
  job: "Content media production"
  source: "https://zapier.com/automations/design/content-media-production/image-resizing-formatting/create-standardized-resized-image-copies-in-your-media-folder"
---

# Create standardized resized image copies in your media folder

## What it does

1. **Trigger:** Schedule by Zapier, every hour at :00, every day of the week.
2. **Google Drive** lists the files in the source folder. Only files whose MIME type starts with `image/` continue.
3. For each image, one step: if the destination folder already has a file with the target name, it's skipped; otherwise Google Drive copies the file into the destination folder under the new name. Each item fails on its own without stopping the others.
4. The run returns counts of copied, already-existing and failed files.

**Note:** the copy is a byte-for-byte duplicate with a new name. The spec describes no pixel resizing, so the workflow doesn't resize. The filename carries the size label.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Schedule by Zapier, `everyHour` (`schedule`). No connection, so `authentication_id` is `null`. Params: `moh: 0`, `weekends: "yes"`.
2. **Connections** (each alias in the code is the app's slug):
   - `google-drive`: the Google Drive connection for the account that owns both folders.
3. **Actions used:**
   - `ae_50140_google_drive_get_files_from_folder_custom` (write type) to list the source folder.
   - `file_v2` (search) to check for an existing destination file by exact name.
   - `copy_file` (write) to create the resized copy.
4. **Constants:**
   - `SOURCE_FOLDER_ID`: the folder ID in the source folder's URL.
   - `DESTINATION_FOLDER_ID`: the folder ID in the media folder's URL.
   - `SIZE_SUFFIX`: appended before the extension. Defaults to `-1080x1080`.
   - `MIME_PREFIX`: defaults to `image/`.

## Ask the user

- Which Drive folder holds the originals, and which holds the media folder for the resized copies?
- Which size label should the suffix use? The default is `-1080x1080`. Customize lists other sizes.
- Should a file that already exists in the destination be skipped? The default is yes.

## Test

Once a Google Drive connection is available, run one draft test (`run_workflow_draft`) with the source folder holding one test image named `[install-test] sample.jpg`, and check that:

- the destination folder gets `[install-test] sample-1080x1080.jpg`, with the same bytes as the original;
- running it again copies nothing and reports `already-exists`;
- the source image itself is unchanged.

Then delete the `[install-test]` files and disable the workflow.

## Customize

- **Other sizes:** change `SIZE_SUFFIX` (e.g. `-1080x1080` or `-640x640`) to produce other sizes.
- **Image processing:** add a crop or compress step before upload for tighter quality control.

## Notes

- Google Drive file lists don't filter by MIME type, so the code filters in JavaScript after the folder listing.
- The step that lists the folder uses a custom Drive action.
- If two source files share a name, the second copy is skipped as already existing.
