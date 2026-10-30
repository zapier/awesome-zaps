---
name: create-parsed-lead-rows-from-incoming-customer-emails
description: Build a Zapier Next Gen Zap that watches a Microsoft Outlook folder for incoming customer emails, keeps the ones that look like leads, and adds a row to a Google Sheets lead sheet with the date, a short description, the customer's note and the message ID. Use when a sales, service or dispatch team triages inbound lead emails from a shared folder and wants them logged in one sheet without copy-paste.
metadata:
  author: zapier
  summary: "Each new lead email in your Outlook folder becomes a row in your lead sheet, with the date and a short summary, so triage starts from one list."
  apps: "Microsoft Outlook, Google Sheets"
  category: "Marketing"
  job: "Lead management"
  source: "https://zapier.com/automations/marketing/lead-management/lead-generation/create-parsed-lead-rows-from-incoming-customer-emails"
---

# Create parsed lead rows from incoming customer emails

## What it does

1. **Trigger:** a new message arrives in the watched Microsoft Outlook folder (Outlook trigger, New Message in Folder).
2. **Filter:** the message's subject or body preview must match the lead pattern. Other mail stops here and writes nothing.
3. **Google Sheets** looks for a row whose source column already holds this message's ID. If one exists, the run stops: duplicates are never logged twice.
4. **Format and parse:** the received time becomes `YYYY-MM-DD HH:mm`, the first sentence of the preview becomes the description, and the first word and a note from the preview go into details.
5. **Google Sheets** adds the row: date, description, details, and source (the message ID).

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Microsoft Outlook, New Message in Folder (`new_message_in_folder`). Set the folder in the trigger's Parent Folder or Child Folder field. It needs the user's Outlook connection.
2. **Connections** (each alias in the code is the app's slug):
   - `microsoft-outlook`: the user's Outlook connection, for the mailbox that receives the leads. Used by the trigger.
   - `google-sheets`: the user's Google Sheets connection, for the account that owns the lead sheet.
3. **Constants:**
   - `SPREADSHEET_ID`: the long ID in the lead sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `DRIVE_ID`: `""` for My Drive, or the Shared Drive's ID.
   - `LEAD_PATTERN`: the words that mark a lead email, as a case-insensitive regex source.
   - `DATE_COLUMN`, `DESCRIPTION_COLUMN`, `DETAILS_COLUMN`, `SOURCE_COLUMN`: column keys such as `COL$A`, not header names. Map the sheet's headers to their column letters.

## Ask the user

- Which Outlook folder should the trigger watch, and whose mailbox is it? If none is given, the whole inbox is watched.
- Which sheet and tab hold the leads, and which columns are the date, description, details and source?
- Which words in a subject or message mark a lead? The default is `lead`, `inquiry` or `quote request`.

## Test

Run this sample as a draft test run before publishing, with a message ID that is not yet in the sheet:

```json
{
  "id": "AAMkAD-sample-message-id-0001",
  "subject": "Quote request from Acme",
  "bodyPreview": "Hi, we'd like a quote for 40 units. Please call me Monday. Thanks, Dana",
  "receivedDateTime": "2026-10-29T10:15:00Z"
}
```

Confirm that one new row appears with the date `2026-10-29 10:15`, the description, the details and the source ID. Then run the same sample again and confirm no second row is added. Delete the test row afterwards if the sheet holds real data.

## Customize

- **Create a CRM contact:** add a step after the row is written to create or update the sender as a contact in the user's CRM.
- **Assign a technician:** add a step that assigns the lead in the dispatch system.
- **Notify the team:** add a Slack or email step for high-priority leads, for example when the message is marked important.

## Notes

- Google Sheets may show the date in the sheet's own format and time zone.
- The message ID is used to match duplicates, so keep the source column and do not edit it.
- Emails are read from the watched folder only. Mail moved in from elsewhere may be logged once it arrives there.
