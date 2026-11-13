---
name: create-searchable-case-log-from-incoming-support-emails
description: Build a Zap on Zapier that logs every new support email in Gmail as a row in a Google Sheets case log, with sender, subject, snippet, attachment flag, timestamp and a case reference number pulled from the subject or body. Use when a support team works from a shared inbox and wants a searchable log of incoming cases without copying emails by hand.
license: MIT
metadata:
  author: zapier
  summary: "Every new support email gets its own row in a Google Sheet, with the sender, subject, a short summary and any order or ticket number it mentions, so the team can search and triage cases in one place."
  apps: "Gmail, Google Sheets"
  category: "Customer Service & Success"
  job: "Omnichannel support"
  source: "https://zapier.com/automations/customer-service-success/omnichannel-support/email-to-ticket-conversion/create-searchable-case-log-from-incoming-support-emails"
---

# Create searchable case log from incoming support emails

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-searchable-case-log-from-incoming-support-emails. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new email lands in the monitored Gmail label or mailbox (`gmail`, `message`).
2. **Code:** pulls a case reference: the first run of `MIN_REFERENCE_DIGITS` or more digits in the subject, or in the body if the subject has none. Short numbers such as a 4-digit account number are ignored.
3. **Google Sheets** looks up the message ID in the log. If a row already has it, the run stops and writes nothing.
4. **Google Sheets** appends a row: message ID, thread ID, sender name, sender email, subject, snippet (summary), reference, whether it has attachments, received time and logged time.

The Zap only appends rows. It never changes or deletes an existing one.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | What goes there                                                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_SPREADSHEET_ID` | The spreadsheet that holds the case log: ask which sheet it is, then look up its ID with the user's Google Sheets connection |

Also ask:

- Which Gmail account and which label or mailbox is the support inbox? Set the trigger's `label_ids` to it. A dedicated label (for example a filter that labels mail sent to support@) is better than `INBOX`, which logs every email.
- Which tab of the sheet is the case log, and which columns should each field go to? Offer to create a new sheet with the default headers.
- What do their case references look like? If they are shorter than 5 digits or contain letters (`CASE-1234`), change `MIN_REFERENCE_DIGITS` or tell them the extraction only finds plain digit runs.

Defaults to review with them: `WORKSHEET_ID` (`"0"` is the first tab), the column keys `MESSAGE_ID_COLUMN` to `LOGGED_AT_COLUMN` (`COL$A` to `COL$J`, in this order: Message ID, Thread ID, Sender Name, Sender Email, Subject, Summary, Reference, Has Attachments, Received At, Logged At; if the user has no log yet, create a sheet with those headers), and `MIN_REFERENCE_DIGITS` (`5`).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` to the user's Google Sheets connection for the account that owns the case log. The trigger's `gmail` alias is the support inbox: bind it to the user's Gmail connection for that inbox.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/message.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it. Set the trigger's `label_ids` param to the monitored label or mailbox. Get the choices with `get_trigger_field_choices` on `label_ids`; system mailboxes use their names (`INBOX`), and user labels look like `Label_123…`. Never leave it empty: an empty value fires on every email, drafts included.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the Gmail trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test (`run_workflow_draft`) with this sample input, which is made-up data and not a real email:

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

Check that one new row appears in the case log, with Reference `48213907` (from the subject, not the body's `55512340099`), Sender Name without quotes, and `'` decoded in the summary. Then run it again with the same input: the run should return `skipped: true, reason: "already-logged"` and no second row should appear. If run-status tools aren't available, check the case log in Google Sheets directly. Ask the user to delete the test row; the agent doesn't delete test data.

Then publish and confirm the trigger is active.

## Notes

- Duplicates are matched on Gmail's message ID only. Replies in the same thread are new messages and get their own rows; the shared thread ID links them.
- The reference is taken from the full plain-text body when Gmail provides it, otherwise from the snippet. The summary column is Gmail's snippet (about 200 characters).
- Google Sheets may show the timestamps in the sheet's own format and time zone.
- To alert someone when no reference is found, add a Slack message or email step after the append that runs when `reference` is empty.
- To update an existing case instead of appending, look up the extracted reference in the Reference column first and update that row (for example, to add a reply count).
- Never commit a real spreadsheet ID.
