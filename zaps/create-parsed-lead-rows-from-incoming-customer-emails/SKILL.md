---
name: create-parsed-lead-rows-from-incoming-customer-emails
description: Build a Zap on Zapier that watches a Microsoft Outlook folder for incoming customer emails, keeps the ones that look like leads, and adds a row to a Google Sheets lead sheet with the date, a short description, the customer's note and the message ID. Use when a sales, service or dispatch team triages inbound lead emails from a shared folder and wants them logged in one sheet without copy-paste.
license: MIT
metadata:
  author: zapier
  summary: "Each new lead email in your Outlook folder becomes a row in your lead sheet, with the date and a short summary, so triage starts from one list."
  apps: "Microsoft Outlook, Google Sheets"
  category: "Marketing"
  job: "Lead management"
  source: "https://zapier.com/automations/marketing/lead-management/lead-generation/create-parsed-lead-rows-from-incoming-customer-emails"
---

# Create parsed lead rows from incoming customer emails

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-parsed-lead-rows-from-incoming-customer-emails. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new message arrives in the watched Outlook folder (`microsoft-outlook`, `new_message_in_folder`).
2. **Filter:** the message's subject or body preview must match the lead pattern. Other mail stops here and writes nothing.
3. **Google Sheets** looks for a row whose source column already holds this message's ID. If one exists, the run stops: duplicates are never logged twice.
4. **Format and parse:** the received time becomes `YYYY-MM-DD HH:mm`, the first sentence of the preview becomes the description, and the first word and a note from the preview go into details.
5. **Google Sheets** adds the row: date, description, details, and source (the message ID).

The Zap only reads the folder and appends rows to the lead sheet. It never replies to or moves a message.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting          | What goes there                                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `SPREADSHEET_ID` | The lead sheet. Find it by name with the user's Google Sheets connection; its ID is the long one in the sheet's URL (`config.ts`) |

Also review the defaults with them: `WORKSHEET_ID` (`"0"` is the first tab), `DRIVE_ID` (`""` for My Drive, or the Shared Drive's ID), `LEAD_PATTERN` (the words that mark a lead; default `lead|inquiry|quote request`), and the column keys `DATE_COLUMN`, `DESCRIPTION_COLUMN`, `DETAILS_COLUMN` and `SOURCE_COLUMN` (`COL$A` to `COL$D`, mapped from the sheet's headers to their column letters).

Questions from the old setup:

- Which Outlook folder should the trigger watch, and whose mailbox is it? Set it in the trigger's Parent Folder or Child Folder field. If none is given, the whole inbox is watched.
- Which sheet and tab hold the leads, and which columns are the date, description, details and source?
- Which words in a subject or message mark a lead?

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `microsoft-outlook` (the mailbox that receives the leads; the trigger uses it) and `google-sheets` (the account that owns the lead sheet) to the user's connections. No other apps need a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-message-in-folder.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run before publishing, with a message ID that is not yet in the sheet:

```json
{
  "id": "AAMkAD-sample-message-id-0001",
  "subject": "Quote request from Acme",
  "bodyPreview": "Hi, we'd like a quote for 40 units. Please call me Monday. Thanks, Dana",
  "receivedDateTime": "2026-10-29T10:15:00Z"
}
```

Check that one new row appears with the date `2026-10-29 10:15`, the description, the details and the source ID. Then run the same sample again and check that no second row is added. If run-status tools aren't available, check the result in Google Sheets directly. Ask the user to delete the test rows, not the agent.

## Notes

- The message ID is the duplicate key, so keep the source column and don't edit it.
- Google Sheets may show the date in the sheet's own format and time zone.
- Only mail in the watched folder is read. Mail moved in from elsewhere is logged once it arrives there.
- To extend it: add a step after the row that creates or updates the sender as a CRM contact, assigns the lead in dispatch, or posts high-priority leads to Slack or email.
