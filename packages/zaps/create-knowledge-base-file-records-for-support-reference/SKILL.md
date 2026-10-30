---
name: create-knowledge-base-file-records-for-support-reference
description: Build a Zapier Next Gen Zap that runs hourly, finds the files in a HubSpot knowledge-base folder and adds one record per file (public URL and name) to a Zapier Table, skipping files already listed. Use when a support team keeps its reference articles in HubSpot files and wants a central index table of them without copying by hand.
metadata:
  author: zapier
  summary: "Every hour, each knowledge-base file in your HubSpot folder is listed in a central support table with its link and name, so agents can find the reference they need."
  apps: "Schedule by Zapier, HubSpot, Zapier Tables"
  category: "Customer Service & Success"
  job: "Customer support operations"
  source: "https://zapier.com/automations/customer-service-success/customer-support-operations/knowledge-base-management/create-knowledge-base-file-records-for-support-reference"
---

# Create knowledge base file records for support reference

## What it does

1. **Trigger:** every hour, Schedule by Zapier starts the workflow. The spec's new-ticket trigger is not used (see Build it).
2. **HubSpot:** lists the files in the knowledge-base parent folder, up to 100, and keeps those that have a public URL.
3. **Zapier Tables:** for each file, looks up the table for a record whose URL field exactly matches the file's URL. If none exists, it creates a record with the URL, the file name as title, and a fixed note.
4. **Result:** the run returns counts of files found, records created, duplicates skipped, and any per-file failures. A failure on one file does not stop the others.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top.

1. **Trigger:** Schedule by Zapier, Every Hour (`schedule` / `everyHour`, time offset `0`, weekends on). No connection; `authentication_id` is `null`. The spec's HubSpot "new ticket" trigger was replaced with this, because the spec's Defaults say to run hourly and the HubSpot connection was unavailable.
2. **Connections** (each alias in the code is the app's slug):
   - `hubspot`: the HubSpot connection for the account that owns the knowledge-base folder. Used by `sdk.fetch` to the HubSpot Files API.
   - `zapier-tables`: Zapier Tables, for the table that holds the file records.
3. **Constants:**
   - `KB_PARENT_FOLDER_ID`: the HubSpot File Manager folder ID of the knowledge-base folder.
   - `TABLE_ID`: the Zapier Table that holds the records.
   - `URL_FIELD`, `TITLE_FIELD`, `NOTES_FIELD`: the table's field keys (shaped like `new__data__f1`), taken from the table's create-record schema. They are not column names.
   - `NOTES_TEXT`: the note written to each new record.

## Ask the user

- Which HubSpot folder holds the knowledge-base files, and what is its folder ID?
- Which Zapier Table should hold the records? Which of its fields holds the file URL (the dedupe key), the title, and the notes?
- Should the scan run only hourly, or also when a ticket is created? The spec's second trigger was not built.

## Test

When the connections exist, run this sample as a draft test run (`run_workflow_draft`) before publishing. The workflow takes no input, so the test is a run of the draft itself:

```json
{}
```

Check that: the run lists the files in the folder; each new file gets one record with its URL, name and note; running again creates no duplicates; and a file with no URL is left out rather than failing the run. Then delete the test records you created, and only those.

## Customize

- **Import only HTML files or one subfolder:** add a filter on the file type or folder before the lookup step.
- **Audit columns:** write the file's last-modified date, or a source ticket reference, into the records.

## Notes

- The HubSpot file listing uses the raw HubSpot Files API through `sdk.fetch`, because no Zapier HubSpot action lists files. Its parameters were not checked against a live account.
- The listing reads one page of up to 100 files. A folder with more files needs paging, which is not built.
- A scheduled run has no ticket, so the spec's "ticket reference in notes" is not built. Each record gets the fixed note instead.
- Never commit a real folder ID, table ID or field key. The records hold public links to support material.
