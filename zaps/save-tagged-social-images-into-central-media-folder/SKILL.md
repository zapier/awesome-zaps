---
name: save-tagged-social-images-into-central-media-folder
description: Build a Zap on Zapier that saves the photo or video from each Instagram post that tags your account into one shared Google Drive media folder, named by uploader and timestamp. Use when a marketing or creative team reuses user-tagged social images for campaigns and wants them collected in one place without manual downloads.
license: MIT
metadata:
  author: zapier
  summary: "When someone tags your Instagram account, their photo or video is copied into your shared media folder with the uploader's name and the post time in the filename, so the team can reuse it."
  apps: "Instagram for Business, Google Drive"
  category: "Design"
  job: "Creative operations"
  source: "https://zapier.com/automations/design/creative-operations/asset-management/save-tagged-social-images-into-central-media-folder"
---

# Save tagged social images into central media folder

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/save-tagged-social-images-into-central-media-folder. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** someone tags your Instagram account in a photo or video (`instagram-for-business`, `new_tag`).
2. **Filter:** if the post has no `media_url`, the run stops there and writes nothing.
3. **Google Drive** copies `media_url` into the media folder (`google-drive`, `file`). The filename is `<uploader>-<timestamp>`: characters in the uploader's name other than letters, digits, `_` and `-` become `_`, and the timestamp keeps only digits, `T` and `-`.

The Zap only reads the tagged post and adds new files to the media folder. It never edits or deletes anything.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting           | What goes there                                                                    |
| ----------------- | ---------------------------------------------------------------------------------- |
| `MEDIA_FOLDER_ID` | The shared media folder in Google Drive; the user names it and its ID is looked up |

Also ask which Instagram for Business account the trigger should watch. It is chosen with `instagramPageId` when the trigger is configured.

Also review the defaults with them: `SKIP_ITEMS_WITHOUT_MEDIA` (`true`) skips posts with no media URL. `false` fails the run instead.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-drive` to a Google account that can write to the media folder (a work account is best), and `instagram-for-business` to the Instagram for Business connection the trigger watches. Both are the user's own connections.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-tag.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Once the trigger has a connection, run the draft with a sample tagged post like this, using a test folder and a test account:

```json
{
  "username": "test_creator",
  "media_url": "https://example.com/sample.jpg",
  "timestamp": "2026-10-29T10:15:00+0000",
  "permalink": "https://www.instagram.com/p/EXAMPLE/",
  "media_type": "IMAGE"
}
```

Check that one file named `test_creator-2026-10-29T1015000000` appears in the media folder, and that a sample with no `media_url` is skipped without a Drive write. The field names come from the trigger's output schema (`username`, `media_url`, `timestamp`); confirm them against a real trigger sample before relying on them. If run-status tools aren't available, check the result in Google Drive directly. The user deletes the test data, not the agent.

## Notes

- The workflow saves the trigger's `media_url` directly. Instagram media URLs can expire, so upload promptly; the trigger should fire soon after the tag.
- The Drive step uses the folder ID as the destination. Google Drive's upload action can also take a folder picked from a list, but the ID is what the workflow code needs.
- To extend it: add a write step after the upload that stores `caption` and `permalink` in a tracker sheet, or a Drive copy step to a second folder constant for a backup archive.
- Never commit a real folder ID. Anyone with access to the folder can read the files.
