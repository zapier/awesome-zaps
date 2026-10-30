---
name: create-searchable-case-log-from-incoming-support-emails
description: Build a Zapier Next Gen Zap that logs every new support email in Gmail as a row in a Google Sheets case log, with sender, subject, snippet, attachment flag, timestamp and a case reference number pulled from the subject or body. Use when a support team works from a shared inbox and wants a searchable log of incoming cases without copying emails by hand.
metadata:
  author: zapier
  summary: "Every new support email gets its own row in a Google Sheet, with the sender, subject, a short summary and any order or ticket number it mentions, so the team can search and triage cases in one place."
  apps: "Gmail, Google Sheets"
  category: "Customer Service & Success"
  job: "Omnichannel support"
  source: "https://zapier.com/automations/customer-service-success/omnichannel-support/email-to-ticket-conversion/create-searchable-case-log-from-incoming-support-emails"
---

# Create searchable case log from incoming support emails

## What it does

1. **Trigger:** a new email lands in the monitored Gmail label or mailbox (Gmail, New Email).
2. **Code (no step):** pulls a case reference: the first run of `MIN_REFERENCE_DIGITS` or more digits in the subject, or in the body if the subject has none. Short numbers such as a 4-digit account number are ignored.
3. **Google Sheets** looks up the message ID in the log. If a row already has it, the run stops and writes nothing.
4. **Google Sheets** appends a row: message ID, thread ID, sender name, sender email, subject, snippet (summary), reference, whether it has attachments, received time and logged time.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Gmail, New Email (`gmail`, `message`). Its `authentication_id` is the user's Gmail connection for the support inbox. Params: `{ "label_ids": "<label or mailbox>" }`. Get the choices with `get_trigger_field_choices` on `label_ids`; system mailboxes use their names (`INBOX`) and user labels look like `Label_123…`. Always set it: an empty value fires on every email, drafts included.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the user's Google Sheets connection, for the account that owns the case log.
3. **Constants:**
   - `SPREADSHEET_ID`: the long ID in the sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `MESSAGE_ID_COLUMN` … `LOGGED_AT_COLUMN`: column keys such as `COL$A`, not header names. They default to A–J in this order: Message ID, Thread ID, Sender Name, Sender Email, Subject, Summary, Reference, Has Attachments, Received At, Logged At. If the user has no log yet, create a sheet with those headers.
   - `MIN_REFERENCE_DIGITS`: the shortest number that counts as a reference. Defaults to `5`.
4. Test with the steps below, then publish and wait until the trigger reads back `active`.

## Ask the user

- Which Gmail account and which label or mailbox is the support inbox? A dedicated label (for example a filter that labels mail sent to support@) is better than `INBOX`, which logs every email.
- Which sheet and tab is the case log, and which columns should each field go to? Offer to create a new sheet with the default headers.
- What do their case references look like? If they are shorter than 5 digits or contain letters (`CASE-1234`), change `MIN_REFERENCE_DIGITS` or tell them the extraction only finds plain digit runs.

## Test

Send a test email to the monitored inbox, read it with the trigger's sample read (Gmail `get_latest_message` with the same `label_ids`, or Gmail Find Email), and pass that record as the input of a draft test run (`run_workflow_draft`). The sample used here, trimmed to the fields the code reads:

```json
{
  "id": "1a189f4f3104ae58",
  "message_id": "1a189f4f3104ae58",
  "thread_id": "1a189f4f3104ae58",
  "from": {
    "name": "\"[install-test] Test Customer\"",
    "email": "support-inbox@example.com"
  },
  "subject": "[install-test] Support: refund for order 48213907 not received",
  "body_plain": "Hi support team,\n\nI was promised a refund for my order last week but it hasn't arrived. My account number is 7765. The original invoice was 55512340099.\n\nThanks,\nTest Customer",
  "date": "Thu, 29 Oct 2026 16:18:13 -0700",
  "attachment_count": 0,
  "raw": {
    "snippet": "Hi support team, I was promised a refund for my order last week but it hasn&#39;t arrived. My account number is 7765. The original invoice was 55512340099. Thanks, Test Customer"
  }
}
```

Check:

- One new row, with Reference `48213907` (from the subject, not the body's `55512340099`), Sender Name without quotes, and `'` decoded in the summary.
- Run it again with the same input: the run returns `skipped: true, reason: "already-logged"` and no second row appears.

## Customize

- **Alert when no reference is found:** after the append, if `reference` is empty, send a Slack message or email so someone triages it by hand.
- **Update an existing case:** look up the extracted reference in the Reference column first and update that row (for example, add the new message ID or a reply count) instead of appending a new one.

## Notes

- Duplicates are matched on Gmail's message ID only. Replies in the same thread are new messages and get their own rows; the shared thread ID links them.
- The reference is taken from the full plain-text body when Gmail provides it, otherwise from the snippet. The summary column is Gmail's snippet (about 200 characters).
- Google Sheets may show the timestamps in the sheet's own format and time zone.
- Never commit a real spreadsheet ID.
