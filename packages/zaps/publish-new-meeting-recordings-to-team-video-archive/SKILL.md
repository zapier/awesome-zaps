---
name: publish-new-meeting-recordings-to-team-video-archive
description: Build a Zapier Next Gen Zap that uploads each finished Zoom cloud recording to Vimeo as an unlisted video and records it in an Airtable archive table, matched by recording GUID. Use when a team wants meeting recordings archived and easy to find without manual uploads or spreadsheet entries.
metadata:
  author: zapier
  summary: "When a Zoom recording finishes, it is uploaded to your video library and a matching row in your archive table links to it, so anyone on the team can find it."
  apps: "Zoom, Vimeo, Airtable"
  category: "Personal Productivity"
  job: "Photo media management"
  source: "https://zapier.com/automations/personal-productivity/photo-media-management/media-library-management/publish-new-meeting-recordings-to-team-video-archive"
---

# Publish new meeting recordings to team video archive

## What it does

1. **Trigger:** a Zoom cloud recording completes (Zoom, New Cloud Recording). The run carries the recording's GUID, title, start time and download URLs.
2. **Loop:** each recording file URL is uploaded to Vimeo, one step per file. A recording with several files produces several uploads.
3. **Vimeo** uploads each file as an unlisted video, named after the meeting title.
4. **Airtable** finds the row whose recording GUID matches and updates it, or creates a new row when none matches. The row gets the title, the Vimeo video link(s) and the meeting start date.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Zoom, New Cloud Recording (`zoom`, `new_recording`). It has no filter settings. Its `authentication_id` is the user's Zoom connection.
2. **Connections** (each alias in the code is the app's slug):
   - `zoom`: the user's Zoom connection, for the account that hosts the meetings.
   - `vimeo`: the user's Vimeo connection, for the account that should hold the archive.
   - `airtable`: the user's Airtable connection, for the account that owns the archive base.
3. **Constants:**
   - `AIRTABLE_BASE_ID`: the base's ID (the `app...` ID in its URL).
   - `AIRTABLE_TABLE`: the table name that holds the archive.
   - `GUID_FIELD`: the column that stores the Zoom recording GUID. Rows are matched on it.
   - `TITLE_FIELD`, `VIDEO_URL_FIELD`, `DATE_FIELD`: the columns for the title, the Vimeo link and the start date.
   - `VIMEO_PRIVACY`: the Vimeo privacy setting for uploads. `"unlisted"` is the default.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their Zoom setup step (below).

## Ask the user

- Which Airtable base and table hold the archive, and which columns hold the recording GUID, title, video link and date?
- Should uploads stay unlisted, or use another Vimeo privacy setting?
- Is the Vimeo account on the same team as the Zoom host? Uploads go to whichever Vimeo account is connected.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a recording in the user's own Zoom account and a GUID that is not yet in the archive:

```json
{
  "uuid": "YOUR_TEST_RECORDING_GUID",
  "topic": "Weekly sync",
  "start_time": "2026-10-29T10:00:00Z",
  "video_dl_urls": "https://example.com/recording-1.mp4"
}
```

Confirm that the Vimeo upload appears as an unlisted video named after the meeting, and that one Airtable row holds the GUID, title, Vimeo link and start date. Run it again with the same GUID and confirm the same row is updated rather than duplicated. Then delete the test video and row if they were only a test.

## Customize

- **Other video hosts:** replace Vimeo with any video service that accepts a file URL upload.
- **Other databases:** swap Airtable for any database or ticketing system that can store a recording GUID and a video link.

## Notes

- Zoom gives the GUID as the meeting UUID, so a recording that is re-sent updates its existing row.
- If one file fails to upload, the other files still upload and the row is still written. The run's return value reports how many uploads failed.
- If every upload fails, the run stops and writes no row, so the failure is visible in the run history.
- Zoom download links expire, so the run should follow the recording promptly after it completes.
