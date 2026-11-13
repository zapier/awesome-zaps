---
name: send-tailored-email-replies-to-new-inbox-messages
description: Build a Zap on Zapier that sends a short, polite AI-written reply to each new message in an Outlook inbox after a 5-minute delay, skipping thread replies and simple acknowledgments. Use when a support or service inbox gets repetitive questions and senders should get a fast, personal-feeling confirmation without anyone triaging by hand.
license: MIT
metadata:
  author: zapier
  summary: "When a new email lands in your Outlook inbox, the sender gets a quick, tailored reply with your company signature, so they know they were heard."
  apps: "Microsoft Outlook, AI by Zapier"
  category: "Customer Service & Success"
  job: "Self service support"
  source: "https://zapier.com/automations/customer-service-success/self-service-support/automated-response-management/send-tailored-email-replies-to-new-inbox-messages"
---

# Send tailored email replies to new inbox messages

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-tailored-email-replies-to-new-inbox-messages. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new message arrives in the connected Outlook inbox (`microsoft-outlook`, `new_message_in_folder`, with no folder set, so every new inbox message).
2. **Filter (plain code):** skips thread replies (subject starts with `Re:`, `Fw:` or `Fwd:`) and short acknowledgments (a preview of 40 characters or fewer that starts with a thank-you or confirmation word). Skipped messages stop there.
3. **Wait:** 5 minutes, so the sender can correct or add information first.
4. **AI** (`ai`): writes a concise HTML reply from the sender's first name, the subject and the preview: a greeting, a 1–2 sentence body and a warm closing.
5. **Send** (`microsoft-outlook`, `send_email`): sends the reply to the sender's address, subject `Re:` plus the original subject, with the company signature appended.

The reply goes only to the sender of the message that triggered it, and the Zap never replies to thread replies or simple acknowledgments.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                          | What goes there                                                                   |
| -------------------------------- | --------------------------------------------------------------------------------- |
| `REPLACE_COMPANY_SIGNATURE_HTML` | The company signature as an HTML block, from `config.ts`, appended to every reply |

Review these defaults with them: the wait before replying (`REPLY_DELAY_SECONDS`, 300 seconds) and the longest preview still treated as an acknowledgment (`ACK_MAX_PREVIEW_CHARS`, 40 characters), both at the top of `workflow.ts`.

Also ask which Outlook inbox it should watch. The trigger has no folder set, so it watches the connected account's whole inbox; a shared inbox or a specific folder needs its name as the trigger's params. Confirm they are happy for every sender, including automated ones, to get a reply.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `microsoft-outlook` to the user's Outlook connection, used for the trigger and the send step. AI by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-message-in-folder.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a sample message whose sender is the user's own Outlook address, so the reply can only go to them:

```json
{
  "from": {
    "emailAddress": {
      "name": "Test Sender",
      "address": "<the user's own Outlook address>"
    }
  },
  "subject": "Where can I find my invoice?",
  "bodyPreview": "Hi, I can't find last month's invoice in my account. Could you point me to it?"
}
```

Confirm the run completes, that the reply arrives in the connected inbox with the signature, and that a thread reply (`Re: …` subject) and a short "Thanks!" preview are skipped. The 5-minute wait is part of the run, so allow for it. If run-status tools aren't available, check the result in Outlook directly. The user deletes the test data; the agent does not. Publish only after the test passes, and confirm the trigger is active.

## Notes

- Replies go to whoever sent the message, so test with your own address first and never publish with a test address in the trigger.
- Acknowledgment and thread-reply detection use simple text rules, not AI judgement. Messages that don't match the rules are replied to.
- Anyone who emails the inbox gets a reply, including automated senders. Consider an allow-list, or a skip for `noreply` addresses, before relying on it.
- To customize, shorten the wait for chosen sender domains, or route messages that match chosen domains or keywords to a review queue before sending.
