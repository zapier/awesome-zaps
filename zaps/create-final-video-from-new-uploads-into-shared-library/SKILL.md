---
name: create-final-video-from-new-uploads-into-shared-library
description: Build a Zap on Zapier that sends each new media file in a Google Drive incoming folder to a render service, polls until the render finishes, and saves the finished MP4 into a shared Google Drive library folder. Use when a video or content team renders final cuts (avatar, voice-over or template videos) from uploaded source media and wants finished files to land in one library for editors without manual downloads and re-uploads.
license: MIT
metadata:
  author: zapier
  summary: "When a new media file lands in your incoming Drive folder, it is sent to your render service, and the finished MP4 is saved into your shared library folder for editors."
  apps: "Google Drive, Webhooks by Zapier"
  category: "Design"
  job: "Content media production"
  source: "https://zapier.com/automations/design/content-media-production/video-editing-workflow-management/create-final-video-from-new-uploads-into-shared-library"
---

# Create final video from new uploads into shared library

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-final-video-from-new-uploads-into-shared-library. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new file is created in, moved to or uploaded to the incoming Google Drive folder (`google-drive`, `file_in_folder_v2`).
2. Files whose MIME type is not video, audio or image are skipped.
3. **Google Drive** looks in the library folder for `<title>.mp4`. If it is already there, the run stops without rendering again.
4. **Webhooks by Zapier** POSTs a JSON render request to the render service: source file ID and link, filename, title (filename without extension), script (the file's Drive description), avatar, voice, aspect ratio, uploader and upload time. The render ID is read from the response.
5. The workflow waits `INITIAL_DELAY_SECONDS`, then **Webhooks by Zapier** GETs the status URL up to `MAX_POLL_ATTEMPTS` times, `POLL_INTERVAL_SECONDS` apart. It stops on a done status with a download URL, or on a failed status.
6. **Google Drive** uploads the MP4 from the download URL into the library folder, named after the source title with the `.mp4` extension forced.

A library file with the same name is never overwritten: the run stops instead. The run returns the render ID and the new library file's ID and link, or `failed: true` with `render-failed` or `render-timed-out`.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                      | Where                                  | What goes there                                                                  |
| ---------------------------- | -------------------------------------- | -------------------------------------------------------------------------------- |
| `REPLACE_INCOMING_FOLDER_ID` | `triggers/file-in-folder.ts`, `folder` | The Google Drive folder where uploads land                                       |
| `REPLACE_LIBRARY_FOLDER_ID`  | `config.ts`                            | The shared library folder that receives the finished MP4s                        |
| `REPLACE_RENDER_REQUEST_URL` | `config.ts`                            | The render service's endpoint for new render jobs (a JSON POST)                  |
| `REPLACE_RENDER_STATUS_URL`  | `config.ts`                            | The render service's status endpoint (GET), with `{id}` where the render ID goes |

Also review the defaults with them:

- `DEFAULT_AVATAR`, `DEFAULT_VOICE` and `DEFAULT_ASPECT_RATIO` (`16:9`): sent with every render.
- `RENDER_ID_FIELD`, `STATUS_FIELD` and `DOWNLOAD_URL_FIELD`: the response fields that hold the render ID, the status and the MP4 URL. Dot paths reach nested fields (`data.id`).
- `DONE_STATUSES` and `FAILED_STATUSES` in `workflow.ts`: the lowercase status values that mean done and failed.
- `INITIAL_DELAY_SECONDS`, `POLL_INTERVAL_SECONDS` and `MAX_POLL_ATTEMPTS`: the polling window, about five minutes by default. Raise them if renders take longer.
- `MEDIA_MIME_PREFIXES` in `workflow.ts`: which uploads count as media.

Also confirm two things before building:

- Does the script come from the file's Drive description, or from somewhere else?
- Does the render service need authentication? The request sends none. If it does, read Notes before installing.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-drive` to the user's Google Drive connection for the account that can read the incoming folder and write to the library folder. The trigger uses the same one. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/file-in-folder.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Use two test folders, `[install-test] Incoming uploads` and `[install-test] Video library`, and point the trigger and `REPLACE_LIBRARY_FOLDER_ID` at them. Without a real renderer, point the render URLs at a test service that returns `{ "id": "..." }` on POST and `{ "status": "done", "download_url": "<public MP4 URL>" }` on GET.

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP):

```json
{
  "id": "test-file-id",
  "title": "[install-test] interview-take-1.mov",
  "mimeType": "video/quicktime",
  "description": "Intro script: welcome to the product tour.",
  "alternateLink": "https://drive.google.com/file/d/test-file-id/view",
  "webContentLink": "https://drive.google.com/uc?id=test-file-id&export=download",
  "createdDate": "2026-10-29T10:00:00.000Z",
  "lastModifyingUserName": "Test Uploader"
}
```

Check that the render service received the payload, that the run polled until done, and that `[install-test] interview-take-1.mp4` is in the library folder and plays. Run the same input again: it should return `already-in-library` without a second render. A sample with `"mimeType": "application/pdf"` should return `not-a-media-file`. If run-status tools aren't available, check the result in Google Drive directly. Then publish, confirm the trigger is active, and ask the user to drop a file in the incoming folder. The user deletes the test data, not the agent.

## Notes

- The renderer can only fetch the source file if it is shared with it or link-shared. The download URL it returns must be publicly fetchable, or signed, for Google Drive's upload to copy it.
- The render request is unauthenticated, and the code holds no API key. For a renderer with a Zapier app, use that app's actions; for an API that needs a key, use a connection.
- Renders that outlast the polling window end with `render-timed-out`. The MP4 is not saved and the run does not retry.
- To render a file again, rename or remove the old `<title>.mp4` from the library.
- To tell production when an MP4 is ready, add a Gmail, Outlook or Slack step after the save with the library link.
- To skip polling, have the renderer call back: replace the polling loop with a callback and send its URL in the render request.
- Never commit a real folder ID or render endpoint.
