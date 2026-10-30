---
name: create-final-video-from-new-uploads-into-shared-library
description: Build a Zapier Next Gen Zap that sends each new media file in a Google Drive incoming folder to a render service, polls until the render finishes, and saves the finished MP4 into a shared Google Drive library folder. Use when a video or content team renders final cuts (avatar, voice-over or template videos) from uploaded source media and wants finished files to land in one library for editors without manual downloads and re-uploads.
metadata:
  author: zapier
  summary: "When a new media file lands in your incoming Drive folder, it is sent to your render service, and the finished MP4 is saved into your shared library folder for editors."
  apps: "Google Drive, Webhooks by Zapier"
  category: "Design"
  job: "Content media production"
  source: "https://zapier.com/automations/design/content-media-production/video-editing-workflow-management/create-final-video-from-new-uploads-into-shared-library"
---

# Create final video from new uploads into shared library

## What it does

1. **Trigger:** a new file is created in, moved to or uploaded to the incoming Google Drive folder.
2. Files whose MIME type is not video, audio or image are skipped.
3. **Google Drive** looks in the library folder for `<title>.mp4`. If it is already there, the run stops without rendering again.
4. **Webhooks by Zapier** POSTs a JSON render request to the render service: source file ID and link, filename, title (filename without extension), script (the file's Drive description), avatar, voice, aspect ratio, uploader and upload time. The render ID is read from the response.
5. The workflow waits `INITIAL_DELAY_SECONDS`, then **Webhooks by Zapier** GETs the status URL up to `MAX_POLL_ATTEMPTS` times, `POLL_INTERVAL_SECONDS` apart. It stops on a done status with a download URL, or on a failed status.
6. **Google Drive** uploads the MP4 from the download URL into the library folder, named after the source title with the `.mp4` extension forced.

The run returns the render ID and the new library file's ID and link, or `failed: true` with `render-failed` or `render-timed-out`.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Drive, New File in Folder (`google-drive`, `file_in_folder_v2`). Its `authentication_id` is the user's Google Drive connection ID, and `params` are `{ "folder": "<incoming folder ID>", "includeDeleted": "false" }` (add `drive` for a shared drive, `includeSubfolders` if uploads land in subfolders). Resolve the folder with `get_trigger_field_choices`.
2. **Connections** (each alias in the code is the app's slug):
   - `google-drive`: the user's Google Drive connection, for the account that can read the incoming folder and write to the library folder. Use the same connection as the trigger.
   - Webhooks by Zapier needs no connection.
3. **Constants:**
   - `RENDER_REQUEST_URL`: the render service's POST endpoint for new render jobs.
   - `RENDER_STATUS_URL`: the status endpoint, with `{id}` where the render ID goes (for example `https://api.example.com/renders/{id}`). The GET also sends `render_id` as a query parameter.
   - `RENDER_ID_FIELD`, `STATUS_FIELD`, `DOWNLOAD_URL_FIELD`: the response fields that hold the render ID, the status and the MP4 URL. Dot paths reach nested fields (`data.id`).
   - `DONE_STATUSES`, `FAILED_STATUSES`: lowercase status values that end polling.
   - `DEFAULT_AVATAR`, `DEFAULT_VOICE`, `DEFAULT_ASPECT_RATIO`: render settings sent with every request.
   - `INITIAL_DELAY_SECONDS` (30), `POLL_INTERVAL_SECONDS` (30), `MAX_POLL_ATTEMPTS` (10): the polling window, about five minutes by default.
   - `LIBRARY_FOLDER_ID`: the shared library folder's ID (from its URL, or the Upload File action's `folder` choices).
   - `MEDIA_MIME_PREFIXES`: which uploads count as media.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user to drop a file in the incoming folder.

## Ask the user

- Which Google Drive folder receives uploads, and which folder is the shared library?
- What is the render service's request URL and status URL, and which response fields carry the render ID, the status and the download URL? Which status values mean done and failed?
- Does the render service need authentication? The code sends none. If it does, see Notes before installing.
- Which avatar, voice and aspect ratio should renders use? Does the script come from the file's Drive description, or somewhere else?
- How long does a typical render take? Raise `MAX_POLL_ATTEMPTS` or `POLL_INTERVAL_SECONDS` if longer than about five minutes.

## Test

Create two test folders, for example `[install-test] Incoming uploads` and `[install-test] Video library`, and point the trigger and `LIBRARY_FOLDER_ID` at them. Without a real renderer, point the render URLs at a test service that returns `{ "id": "..." }` on POST and `{ "status": "done", "download_url": "<public MP4 URL>" }` on GET.

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP), using the ID of a real file in the incoming folder:

```json
{
  "id": "YOUR_TEST_FILE_ID",
  "title": "[install-test] interview-take-1.mov",
  "mimeType": "video/quicktime",
  "description": "Intro script: welcome to the product tour.",
  "alternateLink": "https://drive.google.com/file/d/YOUR_TEST_FILE_ID/view",
  "webContentLink": "https://drive.google.com/uc?id=YOUR_TEST_FILE_ID&export=download",
  "createdDate": "2026-10-29T10:00:00.000Z",
  "lastModifyingUserName": "Test Uploader"
}
```

Check that the render service received the payload, that the run polled until done, and that `[install-test] interview-take-1.mp4` is in the library folder and plays. Run the same input again: it should return `already-in-library` without a second render. A sample with `"mimeType": "application/pdf"` should return `not-a-media-file`.

## Customize

- **Notify production:** add a Gmail, Outlook or Slack step after the save that tells production coordinators the MP4 is ready, with the library link.
- **Webhook callback instead of polling:** if the renderer can call back, replace the polling loop with `ctx.createCallback` and send the callback URL in the render request.

## Notes

- The source link sent to the renderer is the Drive file's download link. The renderer can only fetch it if the file is shared with it (or link-shared); otherwise send it a link it can read, or have it pull from Drive with its own access.
- The render request is unauthenticated. Never put an API key in the constants. For a renderer with a Zapier app, use that app's actions instead; for an API that needs a key, use `sdk.fetch` with a connection.
- "Match renders by upload filename" is implemented as: if `<title>.mp4` already exists in the library, skip. Rename or remove the old file to render again.
- The download URL must be publicly fetchable (or a signed URL) for Google Drive's Upload File to copy it.
- Renders that outlast the polling window return `render-timed-out`; the MP4 is not saved and the run does not retry.
- Never commit a real folder ID or render endpoint.
