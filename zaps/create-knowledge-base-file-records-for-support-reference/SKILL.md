---
name: create-knowledge-base-file-records-for-support-reference
description: Build a Zap on Zapier that runs hourly, finds the files in a HubSpot knowledge-base folder and adds one record per file (public URL and name) to a Zapier Table, skipping files already listed. Use when a support team keeps its reference articles in HubSpot files and wants a central index table of them without copying by hand.
license: MIT
metadata:
  author: zapier
  summary: "Every hour, each knowledge-base file in your HubSpot folder is listed in a central support table with its link and name, so agents can find the reference they need."
  apps: "Schedule by Zapier, HubSpot, Zapier Tables"
  category: "Customer Service & Success"
  job: "Customer support operations"
  source: "https://zapier.com/automations/customer-service-success/customer-support-operations/knowledge-base-management/create-knowledge-base-file-records-for-support-reference"
---

# Create knowledge base file records for support reference

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-knowledge-base-file-records-for-support-reference. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** every hour, on weekdays and weekends, Schedule by Zapier starts the Zap (`schedule`, `everyHour`).
2. **HubSpot** (`hubspot`) lists the files in the knowledge-base folder, up to 100, and keeps those that have a public URL.
3. **Zapier Tables** (`zapier-tables`) checks each file in turn: if no record already has the file's URL, it creates one with the URL, the file name as the title, and a fixed note.
4. **Result:** the run reports how many files it found, how many records it created, how many were already listed, and any per-file failures. A failure on one file does not stop the others.

The Zap only adds records. It never changes or deletes a HubSpot file or a table record.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting               | What goes there                                                       |
| --------------------- | --------------------------------------------------------------------- |
| `KB_PARENT_FOLDER_ID` | The HubSpot File Manager folder that holds the knowledge-base files   |
| `TABLE_ID`            | The Zapier Table that holds one record per knowledge-base file        |
| `URL_FIELD`           | The table field for each file's public URL. It is also the dedupe key |
| `TITLE_FIELD`         | The table field for the file name                                     |
| `NOTES_FIELD`         | The table field for notes                                             |

The field values are the table's field keys, shaped like `new__data__f1`, not column names. Look them up from the table's create-record schema.

Also review the default `NOTES_TEXT` in `config.ts` (the note written to each new record) with them. The schedule in `triggers/every-hour.ts` runs hourly, weekends included.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `hubspot` (the account that owns the knowledge-base folder) and `zapier-tables` (the account that owns the table) to the user's connections. Schedule by Zapier needs none.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/every-hour.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test before publishing, against a table the user can delete test records from. The workflow takes no input, so the sample is an empty object:

```json
{}
```

Check that the run lists the files in the folder; each new file gets one record with its URL, name and note; running it again creates no duplicates; and a file with no URL is left out rather than failing the run. If run-status tools aren't available, check the result in Zapier Tables directly. Ask the user to delete the test records; the agent does not delete them.

## Notes

- The HubSpot listing calls the HubSpot Files API directly through `sdk.fetch`, because no Zapier HubSpot action lists files. Its parameters have not been checked against a live account, so confirm the first test run lists the expected files.
- The listing reads one page of up to 100 files. A folder with more files needs paging, which is not built.
- A scheduled run has no ticket, so each record gets the fixed note only.
- To narrow the import, add a filter on file type or subfolder before the lookup step. To add audit columns, write the file's last-modified date into a field.
- Never commit a real folder ID, table ID or field key. The records hold public links to support material.
