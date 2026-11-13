---
name: publish-new-meeting-recordings-to-team-video-archive
description: Build a Zap on Zapier that uploads each finished Zoom cloud recording to Vimeo as an unlisted video and records it in an Airtable archive table, matched by recording GUID. Use when a team wants meeting recordings archived and easy to find without manual uploads or spreadsheet entries.
license: MIT
metadata:
  author: zapier
  summary: "When a Zoom recording finishes, it is uploaded to your video library and a matching row in your archive table links to it, so anyone on the team can find it."
  apps: "Zoom, Vimeo, Airtable"
  category: "Personal Productivity"
  job: "Photo media management"
  source: "https://zapier.com/automations/personal-productivity/photo-media-management/media-library-management/publish-new-meeting-recordings-to-team-video-archive"
---

# Publish new meeting recordings to team video archive

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/publish-new-meeting-recordings-to-team-video-archive. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Zoom cloud recording completes (`zoom`, `new_recording`). The run carries the recording's GUID, title, start time and download URLs.
2. **Loop:** each recording file URL is uploaded to Vimeo, one step per file. A recording with several files produces several uploads.
3. **Vimeo** uploads each file as an unlisted video, named after the meeting title.
4. **Airtable** finds the row whose recording GUID matches and updates it, or creates a new row when none matches. The row gets the title, the Vimeo video link(s) and the meeting start date.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting            | What goes there                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| `AIRTABLE_BASE_ID` | The Airtable base that holds the archive: its ID (the `app…` ID), looked up from the base the user names |
| `AIRTABLE_TABLE`   | The table in that base that holds the archive                                                            |
| `GUID_FIELD`       | The column that stores the Zoom recording GUID. Existing rows are matched on it                          |
| `TITLE_FIELD`      | The column for the recording title                                                                       |
| `VIDEO_URL_FIELD`  | The column for the Vimeo video link                                                                      |
| `DATE_FIELD`       | The column for the meeting start date                                                                    |

Also review the default `VIMEO_PRIVACY` with them: `"unlisted"` keeps videos off public listings. Confirm the Vimeo account is on the same team as the Zoom host, since uploads go to whichever Vimeo account is connected.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `vimeo` (the account that should hold the archive) and `airtable` (the account that owns the archive base) to the user's connections. Bind `zoom` (the account that hosts the meetings) for the trigger. Name any apps that need no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-recording.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run (`run_workflow_draft`) before publishing, with a GUID that is not yet in the archive:

```json
{
  "uuid": "sample-recording-guid-001",
  "topic": "Weekly sync",
  "start_time": "2026-10-29T10:00:00Z",
  "video_dl_urls": "https://example.com/recording-1.mp4"
}
```

Check that the Vimeo upload appears as an unlisted video named "Weekly sync", and that one Airtable row holds the GUID, title, Vimeo link and start date. Run it again with the same GUID and check that the same row is updated rather than duplicated. If run-status tools aren't available, check Vimeo and Airtable directly. The user deletes the test video and row, not the agent. Then publish, and confirm the trigger is active.

## Notes

- Zoom gives the GUID as the meeting UUID, so a recording that is re-sent updates its existing row.
- If one file fails to upload, the others still upload and the row is still written; the run reports how many failed. If every upload fails, the run stops and writes no row.
- Zoom download links expire, so the run should follow the recording promptly.
- To archive elsewhere, replace Vimeo with any video service that accepts a file URL, or Airtable with any database or ticketing system that can store a GUID and a video link.
