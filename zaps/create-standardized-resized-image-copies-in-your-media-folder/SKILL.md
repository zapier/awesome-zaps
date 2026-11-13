---
name: create-standardized-resized-image-copies-in-your-media-folder
description: Build a Zap on Zapier that runs hourly, finds new image files in a source Google Drive folder, and writes a copy of each into a destination folder with a size-specific filename, such as photo-1080x1080.jpg. Use when a content team keeps originals in one Drive folder and needs standardized, size-named copies ready in another without manual renaming.
license: MIT
metadata:
  author: zapier
  summary: "Each hour, new images in your source folder get a size-named copy in your media folder, so content teams find standardized files without renaming anything."
  apps: "Schedule by Zapier, Google Drive"
  category: "Design"
  job: "Content media production"
  source: "https://zapier.com/automations/design/content-media-production/image-resizing-formatting/create-standardized-resized-image-copies-in-your-media-folder"
---

# Create standardized resized image copies in your media folder

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-standardized-resized-image-copies-in-your-media-folder. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** Schedule by Zapier (`schedule`, `everyHour`), every hour at :00, every day of the week.
2. **Google Drive** lists the files in the source folder. Only files whose MIME type starts with `image/` continue.
3. For each image, Google Drive checks the destination folder. If a file with the new name is already there, the image is skipped; otherwise Google Drive copies the file into the destination folder under the new name. Each image fails on its own without stopping the others.
4. The run returns counts of copied, already-existing and failed files.

The copy is a byte-for-byte duplicate with a new name. The Zap does not resize pixels; the filename carries the size label.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                         | What goes there                                                                                                             |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_SOURCE_FOLDER_ID`      | The Drive folder holding the original images. Ask which folder, then look up its ID with their Google Drive connection      |
| `REPLACE_DESTINATION_FOLDER_ID` | The media folder that receives the resized copies. Ask which folder, then look up its ID with their Google Drive connection |

Also review the defaults with them: `SIZE_SUFFIX` (`-1080x1080`, appended before the extension; change it for other sizes) and `MIME_PREFIX` (`image/`, the MIME type prefix that counts as an image).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-drive` to the user's Google Drive connection for the account that owns both folders. Schedule by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/every-hour.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connection (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a source folder that holds one test image named `[install-test] sample.jpg`, and a destination folder the user controls. Check that:

- the destination folder gets `[install-test] sample-1080x1080.jpg`, with the same bytes as the original;
- running it again copies nothing and reports `already-exists`;
- the source image itself is unchanged.

If run-status tools aren't available, check the destination folder in Google Drive directly. Then publish, confirm the trigger is active, and ask the user to delete the `[install-test]` files; the agent doesn't delete test data.

## Notes

- Google Drive file lists don't filter by MIME type, so the code filters the listing after it returns. The listing uses a custom Drive action.
- If two source files share a name, the second copy is skipped as already existing.
- To change the size label, edit `SIZE_SUFFIX` in `config.ts`.
- The Zap only copies. To crop or compress, add a processing step before the copy.
