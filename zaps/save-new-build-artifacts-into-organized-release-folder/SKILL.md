---
name: save-new-build-artifacts-into-organized-release-folder
description: Build a Zap on Zapier that copies each new build artifact in one Google Drive folder into a release folder under a timestamped, reproducible name, without manual filing. Use when build artifacts land in one Google Drive folder and release or engineering teams need each one copied into a release folder.
license: MIT
metadata:
  author: zapier
  summary: "When a new build artifact lands in your source folder, a timestamped copy is saved into your release folder, so teams can find reproducible files without filing them by hand."
  apps: "Google Drive"
  category: "Engineering"
  job: "Software delivery"
  source: "https://zapier.com/automations/engineering/software-delivery/release-management/save-new-build-artifacts-into-organized-release-folder"
---

# Save new build artifacts into organized release folder

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/save-new-build-artifacts-into-organized-release-folder. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new file appears in the source folder in Google Drive (`google-drive`, `file_in_folder_v2`). Subfolders are not watched.
2. **Google Drive** copies that file into the release folder, named `<ISO timestamp> <original filename>`. Each run makes a new copy, so nothing is overwritten.

The Zap only copies files. It never changes or moves the source file.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting             | Where                                                     | What goes there                                                                           |
| ------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `SOURCE_FOLDER_ID`  | `config.ts`, and `folder` in `triggers/file-in-folder.ts` | The Google Drive folder that build artifacts land in. Use the same answer in both places. |
| `RELEASE_FOLDER_ID` | `config.ts`                                               | The Google Drive folder that holds the timestamped release copies.                        |

Also review the trigger's settings with them: Include Subfolders is off and Include Deleted Files is set to non-deleted files only, both in `triggers/file-in-folder.ts`.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-drive` to the user's Google Drive connection for the account that owns both folders. The trigger and the action use the same one. No other app needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/file-in-folder.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's `folder` to the same answer as `SOURCE_FOLDER_ID`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the Google Drive action's fields with the user's connection and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a small test file the user owns in the source folder, using that file's ID as `id`:

```json
{
  "id": "<test file ID>",
  "title": "[install-test] app-1.2.3.zip",
  "originalFilename": "[install-test] app-1.2.3.zip"
}
```

Check that one copy appears in the release folder, named with the run's ISO timestamp followed by the original filename, and that the source file is unchanged. If run-status tools aren't available, check the release folder in Google Drive directly. Ask the user to delete the test copy, since the agent does not delete test data.

## Notes

- Copy File has no description field, so the copy has no description.
- The trigger payload has no separate build identifier, so the timestamp and original filename are the only parts of the name.
- Folder IDs are per person. Don't commit real ones.
- To share the release folder with a release group, add a Google Drive step that sets sharing on it.
- To skip small files, add a conditional step that ignores files below a size threshold.
