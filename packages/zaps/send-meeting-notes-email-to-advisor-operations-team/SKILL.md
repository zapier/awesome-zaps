---
name: send-meeting-notes-email-to-advisor-operations-team
description: Build a Zapier Next Gen Zap that turns an incoming call event (posted to a webhook) into an HTML meeting-notes email from Microsoft Outlook to advisors, with operations coordinators copied, and ignores duplicate webhook retries. Use when an advisory, wealth or client-services team wants call context in everyone's inbox for same-day follow-up without writing recap emails by hand.
metadata:
  author: zapier
  summary: "When a call ends, advisors get an email with the call title, who was on it, the topics discussed and the meeting link, with ops coordinators copied, so follow-up can happen the same day."
  apps: "Webhooks by Zapier, Microsoft Outlook"
  category: "Executives"
  job: "Meeting management"
  source: "https://zapier.com/automations/executives/meeting-management/meeting-notes-distribution/send-meeting-notes-email-to-advisor-operations-team"
---

# Send meeting notes email to advisor operations team

## What it does

1. **Trigger:** a call event arrives at a Webhooks by Zapier catch hook (a call recorder, dialer, CRM or script posts to it).
2. **Microsoft Outlook** searches the mailbox for the event ID. If an email whose subject carries `(Ref <event_id>)` is already there, the run stops: it is a webhook retry.
3. The workflow builds the email in code: subject from the call title, a participant list, a bullet list of discussion topics and the meeting link, escaped as HTML.
4. **Microsoft Outlook** sends it to the advisor list, CCs the ops coordinators and sets Reply-To to the team mailbox.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`, and its `params` are empty.
2. **Connections** (each alias in the code is the app's slug):
   - `microsoft-outlook`: the user's Outlook connection for the mailbox that sends the notes. Both the dedupe search and the send use it.
3. **Constants:**
   - `ADVISOR_EMAILS`: list of advisor addresses (To).
   - `OPS_CC_EMAILS`: list of ops coordinator addresses (CC). `[]` for none.
   - `REPLY_TO_EMAIL`: team mailbox for replies. `""` to reply to the sender.
   - `SUBJECT_PREFIX`: text before the call title. The tested value is `"[install-test] Meeting notes: "`; change it to something like `"Meeting notes: "` for real use.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point their call system at.

## Ask the user

- Who are the advisors (To) and the ops coordinators (CC)? A distribution list address works as one entry.
- Which team mailbox should replies go to?
- Which Outlook account sends the notes?
- What does their call system post? The code reads `event_id` (or `submission_id`), `call_title`, `participants` (a list of names, of `{ name, email }` objects, or a comma/newline-separated string), `topics` (a list or a comma/newline-separated string) and `meeting_link`. If their field names differ, tell them before installing; missing fields fall back to "Client call", "Not provided" or "None recorded" rather than failing.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, with every address constant set to the connected Outlook account's own address:

```json
{
  "event_id": "installtest20261029opus",
  "call_title": "Quarterly review with Jordan Lee",
  "participants": [
    { "name": "Jordan Lee", "email": "jordan@example.com" },
    "Sam Advisor"
  ],
  "topics": [
    "Rebalance retirement portfolio",
    "Update beneficiary forms",
    "Schedule tax planning session"
  ],
  "meeting_link": "https://example.com/meetings/abc123"
}
```

Check that one email arrived with the subject `… Quarterly review with Jordan Lee (Ref installtest20261029opus)`, both participants listed, three topic bullets, a clickable link, and the CC and Reply-To set. To test dedupe, wait a minute and run the same payload again: it should return `{ skipped: true, reason: "duplicate-event" }` and send nothing. Use a fresh `event_id` for each new send test.

## Customize

- **VIP routing:** send high-priority calls to a lead advisor when the payload has a VIP flag.
- **Attachments:** when the webhook includes a recording or transcript link, attach it (the Outlook Send Email action accepts file URLs).

## Notes

- Dedupe relies on Outlook's mailbox search, which can lag a few seconds behind a send. A retry that lands within that window may send a second email. Payloads without `event_id` or `submission_id` are never deduped.
- The event ID appears in the subject as `(Ref …)`; removing it from the subject breaks dedupe.
- Outlook ignores HTML styling it doesn't support, so the email is kept to plain headings, paragraphs and a list.
- Never commit real addresses or the webhook URL. Anyone with the webhook URL can send emails to the advisor list.
