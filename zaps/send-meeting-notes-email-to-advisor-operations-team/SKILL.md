---
name: send-meeting-notes-email-to-advisor-operations-team
description: Build a Zap on Zapier that turns an incoming call event (posted to a webhook) into an HTML meeting-notes email from Microsoft Outlook to advisors, with operations coordinators copied, and ignores duplicate webhook retries. Use when an advisory, wealth or client-services team wants call context in everyone's inbox for same-day follow-up without writing recap emails by hand.
license: MIT
metadata:
  author: zapier
  summary: "When a call ends, advisors get an email with the call title, who was on it, the topics discussed and the meeting link, with ops coordinators copied, so follow-up can happen the same day."
  apps: "Webhooks by Zapier, Microsoft Outlook"
  category: "Executives"
  job: "Meeting management"
  source: "https://zapier.com/automations/executives/meeting-management/meeting-notes-distribution/send-meeting-notes-email-to-advisor-operations-team"
---

# Send meeting notes email to advisor operations team

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-meeting-notes-email-to-advisor-operations-team. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a call event arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). A call recorder, dialer, CRM or script posts to it.
2. **Microsoft Outlook** searches the mailbox for the event ID. If an email whose subject carries `(Ref <event_id>)` is already there, the run stops: it is a webhook retry.
3. The workflow builds the email in code: subject from the call title, a participant list, a bullet list of discussion topics and the meeting link, escaped as HTML.
4. **Microsoft Outlook** sends it to the advisor list, copies the ops coordinators and sets Reply-To to the team mailbox.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                          | What goes there                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `REPLACE_ADVISOR_EMAILS`         | The advisor addresses that get the notes (To), one per entry. A distribution list address works as one entry. |
| `REPLACE_OPS_COORDINATOR_EMAILS` | The ops coordinator addresses copied on every email (CC), one per entry. Use an empty list for no CC.         |
| `REPLACE_REPLY_TO_EMAIL`         | The team mailbox replies should go to (Reply-To). Use `""` to reply to the sender.                            |

Also review the default `SUBJECT_PREFIX` in `config.ts`. It is the test value `[install-test] Meeting notes: `; change it to something like `Meeting notes: ` for real use.

Before building, confirm:

- Which Outlook account sends the notes? It is bound under Accounts below.
- What does their call system post? The code reads `event_id` (or `submission_id`), `call_title`, `participants` (a list of names, of `{ name, email }` objects, or a comma or newline separated string), `topics` (a list or a comma or newline separated string) and `meeting_link`. If their field names differ, tell them before installing. Missing fields fall back to "Client call", "Not provided" or "None recorded" rather than failing.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `microsoft-outlook` to the user's Outlook connection for the mailbox that sends the notes. The dedupe search and the send both use it. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it. The webhook trigger has no connection, so its `authentication_id` is `null`.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger, if it has one, before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run before publishing, with every address set to the connected Outlook account's own address:

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

If run-status tools aren't available, check the result in Microsoft Outlook directly. Ask the user to delete the test emails; the agent should not delete them. Then publish, confirm the trigger is active, and give the user their webhook URL to point their call system at.

## Notes

- Dedupe relies on Outlook's mailbox search, which can lag a few seconds behind a send, so a retry inside that window may send a second email. Payloads without `event_id` or `submission_id` are never deduped.
- Keep `(Ref …)` in the subject. Removing it breaks dedupe.
- Outlook ignores HTML styling it doesn't support, so the email uses plain headings, paragraphs and a list.
- Anyone with the webhook URL can send email to the advisor list. Keep the URL private and never commit real addresses.
- To extend it, route high-priority calls to a lead advisor when the payload carries a VIP flag, or attach the recording or transcript link when the webhook includes one.
