---
name: save-client-call-audio-to-team-shared-drive
description: Build a Zap on Zapier that saves the audio of each new Zoom cloud recording to a team Dropbox folder, named by client, date and "AudioRecording", and logs the meeting in a Zapier Table. Use when a team records client calls on Zoom and wants the audio filed for the whole team without manual uploads.
license: MIT
metadata:
  author: zapier
  summary: "Each finished client call's audio is saved to the team's shared folder with the client's name and the call date, so anyone on the team can find it."
  apps: "Zoom, Zapier Tables, Dropbox"
  category: "Personal Productivity"
  job: "File management"
  source: "https://zapier.com/automations/personal-productivity/file-management/cloud-file-sync/save-client-call-audio-to-team-shared-drive"
---

# Save client call audio to team shared drive

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/save-client-call-audio-to-team-shared-drive. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Zoom cloud recording finishes (`zoom`, `new_recording`).
2. The workflow takes the meeting's audio-only M4A file from the recording's file list. If the recording has no audio file, the run stops and saves nothing.
3. **Zapier Tables** looks up the meeting ID in the client-call table. If no row matches, it creates a placeholder row with the status `Needs client`.
4. **Dropbox** uploads the audio to the team folder as `<client name> <YYYY-MM-DD> AudioRecording`, with a sharing link in the run output. The client name comes from the table row, or the meeting topic if the row has none. Dropbox never overwrites an existing file with the same name.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | What goes there                                                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_TABLE_ID`       | The Zapier table with one row per client call, keyed by Zoom meeting ID. Look it up with the user's Zapier Tables connection |
| `REPLACE_DROPBOX_FOLDER` | The team's shared Dropbox folder for client audio, such as `/Team/Client calls`                                              |

Also review the defaults with them: `MEETING_ID_FIELD` and `CLIENT_NAME_FIELD` are the table's field keys for the Zoom meeting ID and client name columns (read them from the table with `inspect_zapier_actions`), `PLACEHOLDER_STATUS` (`"Needs client"`) is the status for placeholder rows, and `FILE_SUFFIX` (`"AudioRecording"`) is the words after the date in the file name.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `zoom` (the Zoom account that hosts the calls), `zapier-tables` (Zapier Tables, for the client-call table) and `dropbox` (the Dropbox account that owns the team folder) to the user's connections.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-recording.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with a meeting ID that is not in the user's table and a folder the user doesn't mind filling:

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

Check that one placeholder row was created with the meeting ID and status, that the file was saved as `Discovery call 2026-10-29 AudioRecording` in the chosen folder, and that the run output has a sharing link. If run-status tools aren't available, check the table and the Dropbox folder directly. Then publish, confirm the trigger is active, and point the user at the Zoom account that should send recordings. The user deletes the test row and file, not the agent.

## Notes

- Zoom gives each recording a download link. The link may need the Zoom account's authorization, so the Dropbox upload can fail for some recordings. The run output shows the failure.
- The file name uses the meeting date in UTC, from the start time in the Zoom payload. Only the first M4A audio file is saved per recording.
- To extend it: save the Zoom transcript next to the audio so calls can be searched by text, or send the file name and sharing link to an operations channel or coordinator's email after the upload.
- Keep real table IDs, folder paths and webhook URLs out of shared copies. Anyone with the trigger's webhook URL can start runs.
