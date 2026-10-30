---
name: save-tagged-social-images-into-central-media-folder
description: Build a Zapier Next Gen Zap that saves the photo or video from each Instagram post that tags your account into one shared Google Drive media folder, named by uploader and timestamp. Use when a marketing or creative team reuses user-tagged social images for campaigns and wants them collected in one place without manual downloads.
metadata:
  author: zapier
  summary: "When someone tags your Instagram account, their photo or video is copied into your shared media folder with the uploader's name and the post time in the filename, so the team can reuse it."
  apps: "Instagram for Business, Google Drive"
  category: "Design"
  job: "Creative operations"
  source: "https://zapier.com/automations/design/creative-operations/asset-management/save-tagged-social-images-into-central-media-folder"
---

# Save tagged social images into central media folder

## What it does

1. **Trigger:** Instagram for Business, New Tagged Media (`new_tag`). It fires when your account is tagged in a photo or video.
2. **Filter:** if the post has no `media_url`, the run stops there and writes nothing.
3. **Google Drive, Upload File:** copies `media_url` into the media folder. The filename is `<uploader>-<timestamp>`, with characters other than letters, digits, `_`, `-` and the timestamp's `T` and `-` removed.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Instagram for Business, New Tagged Media (`instagram-for-business` / `new_tag`). It needs an Instagram for Business connection, and its `instagramPageId` is a dropdown of Instagram accounts linked to Facebook Pages you administer.
2. **Connections** (each alias in the code is the app's slug):
   - `google-drive`: a Google account that can write to the media folder. Use a work account.
3. **Constants:**
   - `MEDIA_FOLDER_ID`: the long ID in the media folder's URL.
   - `SKIP_ITEMS_WITHOUT_MEDIA`: `true` skips posts with no media URL. `false` fails the run instead.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL if the trigger shows one.

## Ask the user

- Which Google Drive folder is the shared media folder? Give its ID for `MEDIA_FOLDER_ID`.
- Which Instagram for Business account should the trigger watch? It is chosen with `instagramPageId` when the trigger is configured.
- Should a post with no media URL be skipped (default) or should the run fail?

## Test

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

Check that one file named `test_creator-2026-10-29T1015000000` (uploader and timestamp, with the colons and `+` removed) appears in the media folder, and that a sample with no `media_url` is skipped without a Drive write. The field names come from the trigger's output schema (`username`, `media_url`, `timestamp`); confirm them against a real trigger sample before relying on them.

## Customize

- **Also add a text record with the post caption to your content tracker:** add a write step after the upload that stores `caption` and `permalink` in a tracker sheet or database.
- **Or copy files to a backup folder for long-term archive:** add a Drive copy step after the upload, to a second folder constant.

## Notes

- The workflow saves the trigger's `media_url` directly. Instagram media URLs can expire, so upload promptly; the trigger should fire soon after the tag.
- The Drive step uses the folder ID as the destination. Google Drive's upload action can also take a folder picked from a list, but the ID is what the workflow code needs.
- Never commit a real folder ID. Anyone with access to the folder can read the files.
