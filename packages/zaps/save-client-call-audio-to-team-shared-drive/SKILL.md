---
name: save-client-call-audio-to-team-shared-drive
description: Build a Zapier Next Gen Zap that saves the audio of each new Zoom cloud recording to a team Dropbox folder, named by client, date and "AudioRecording", and logs the meeting in a Zapier Table. Use when a team records client calls on Zoom and wants the audio filed for the whole team without manual uploads.
metadata:
  author: zapier
  summary: "Each finished client call's audio is saved to the team's shared folder with the client's name and the call date, so anyone on the team can find it."
  apps: "Zoom, Zapier Tables, Dropbox"
  category: "Personal Productivity"
  job: "File management"
  source: "https://zapier.com/automations/personal-productivity/file-management/cloud-file-sync/save-client-call-audio-to-team-shared-drive"
---

# Save client call audio to team shared drive

## What it does

1. **Trigger:** a Zoom cloud recording finishes (New Cloud Recording).
2. The workflow takes the meeting's audio-only M4A file from the recording's file list. If the recording has no audio file, the run stops and saves nothing.
3. **Zapier Tables** looks up the meeting ID in your client-call table. If no row matches, it creates a placeholder row with the status `Needs client`.
4. **Dropbox** uploads the audio to your team folder as `<client name> <YYYY-MM-DD> AudioRecording`, with a sharing link in the run output. The client name comes from the table row, or the meeting topic if the row has none.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Zoom, New Cloud Recording (`zoom`, `new_recording`). It has no parameters.
2. **Connections** (each alias in the code is the app's slug):
   - `zoom`: the Zoom account that hosts the calls.
   - `zapier-tables`: Zapier Tables.
   - `dropbox`: the Dropbox account that owns the team folder.
3. **Constants:**
   - `TABLE_ID`: the Zapier Tables table with one row per client call.
   - `MEETING_ID_FIELD`: the field key for the Zoom meeting ID column. Read it from the table with `inspect_zapier_actions`.
   - `CLIENT_NAME_FIELD`: the field key for the client name column.
   - `DROPBOX_FOLDER`: the team folder path, such as `/Team/Client calls`.
   - `PLACEHOLDER_STATUS`: the status written to a placeholder row. Defaults to `"Needs client"`.
   - `FILE_SUFFIX`: the words after the date in the file name. Defaults to `"AudioRecording"`.
4. Test with the steps below, then publish, wait until the trigger is active, and point the user at the Zoom account that should send recordings.

## Ask the user

- Which Zapier table holds one row per client call? Which of its columns hold the Zoom meeting ID and the client name?
- Which Dropbox folder is the team's shared folder for client audio?
- Should placeholder rows (no client match) use a status other than `Needs client`?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, with a meeting ID that is not in the user's table and a folder the user doesn't mind filling:

```json
{
  "id": 85746065123,
  "topic": "Discovery call",
  "start_time": "2026-10-29T15:00:00Z",
  "recording_files": [
    {
      "file_type": "MP4",
      "download_url": "https://example.zoom.us/rec/download/video"
    },
    {
      "file_type": "M4A",
      "download_url": "https://example.zoom.us/rec/download/audio"
    }
  ]
}
```

Confirm that a placeholder row was created with the meeting ID and status, that the file was saved as `Discovery call 2026-10-29 AudioRecording` in the chosen folder, and that the run output has a sharing link. Then tell the user to delete the test row and file if they were not real.

## Customize

- **Save a transcript:** add a step that saves the Zoom audio transcript next to the audio, so calls can be searched by text.
- **Post-upload notification:** after the upload, send a message to the operations channel or a coordinator's email with the file name and sharing link.

## Notes

- Zoom gives each recording a download link. The link may need the Zoom account's authorization to download, so the Dropbox upload can fail for some recordings. The run output shows the failure.
- The file name uses the meeting date in UTC, from the start time in the Zoom payload.
- Only one file is saved per recording: the first M4A audio file.
- Never commit real table IDs, folder paths or webhook URLs. Anyone with the trigger's webhook URL can start runs.
