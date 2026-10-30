---
name: send-tailored-email-replies-to-new-inbox-messages
description: Build a Zapier Next Gen Zap that sends a short, polite AI-written reply to each new message in an Outlook inbox after a 5-minute delay, skipping thread replies and simple acknowledgments. Use when a support or service inbox gets repetitive questions and senders should get a fast, personal-feeling confirmation without anyone triaging by hand.
metadata:
  author: zapier
  summary: "When a new email lands in your Outlook inbox, the sender gets a quick, tailored reply with your company signature, so they know they were heard."
  apps: "Microsoft Outlook, AI by Zapier"
  category: "Customer Service & Success"
  job: "Self service support"
  source: "https://zapier.com/automations/customer-service-success/self-service-support/automated-response-management/send-tailored-email-replies-to-new-inbox-messages"
---

# Send tailored email replies to new inbox messages

## What it does

1. **Trigger:** a new message arrives in the connected Outlook inbox (Microsoft Outlook, New Message in Folder, with no folder set, so every new inbox message).
2. **Filter (plain code):** skips thread replies (subject starts with `Re:`, `Fw:` or `Fwd:`) and short acknowledgments (a preview of 40 characters or fewer that starts with a thank-you or confirmation word). Skipped messages stop there.
3. **Wait:** 5 minutes, so the sender can correct or add information first.
4. **AI by Zapier:** writes a concise HTML reply from the sender's first name, the subject and the preview: a greeting, a 1–2 sentence body and a warm closing.
5. **Microsoft Outlook, Send Email:** sends the reply to the sender's address, subject `Re:` plus the original subject, with your company signature appended.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** `microsoft-outlook` / `new_message_in_folder`, with empty params (all new messages in the inbox). Outlook trigger parameters for a shared inbox or a specific folder are left blank.
2. **Connections** (each alias in the code is the app's slug):
   - `microsoft-outlook`: the user's Outlook connection, used for the trigger and the send step.
   - AI by Zapier (`ai`) needs no connection: it uses Zapier-managed credentials (`authentication_id: "0"`).
3. **Constants:**
   - `COMPANY_SIGNATURE_HTML`: the HTML signature block appended to every reply. Replace `YOUR_COMPANY_SIGNATURE` with the real block.
   - `REPLY_DELAY_SECONDS`: seconds to wait before replying. Defaults to `300` (5 minutes).
   - `ACK_MAX_PREVIEW_CHARS`: the longest preview still treated as a simple acknowledgment. Defaults to `40`.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user where to see the replies being sent.

## Ask the user

- Which Outlook inbox should it watch? The default is the connected account's own inbox; a shared inbox or a specific folder needs its name as the trigger's params.
- What should the company signature say? Put the HTML block in `COMPANY_SIGNATURE_HTML`.
- Should the wait stay at 5 minutes, or be shorter for known senders?

## Test

Before publishing, run one draft test (`run_workflow_draft` in Zapier MCP) with a sample message whose sender is the connected account's own address, so the reply can only go to the user:

```json
{
  "from": {
    "emailAddress": {
      "name": "Test Sender",
      "address": "YOUR_OWN_OUTLOOK_ADDRESS"
    }
  },
  "subject": "Where can I find my invoice?",
  "bodyPreview": "Hi, I can't find last month's invoice in my account. Could you point me to it?"
}
```

Confirm the run completes, that the reply email arrives in the connected inbox with the signature, and that a thread reply (`Re: …` subject) and a short "Thanks!" preview are skipped. The 5-minute wait is part of the run, so allow for it.

## Customize

- **Faster replies for VIP domains:** shorten or remove the wait for chosen sender domains.
- **Human review for risky topics:** route messages that match given domains or keywords to a review queue before sending.

## Notes

- Replies go to whoever sent the message, so test with your own address first and never publish with a test address in the trigger.
- Acknowledgment and thread-reply detection use simple text rules, not AI judgement. Messages that don't match the rules are replied to.
- Anyone who emails the inbox gets a reply, including automated senders. Consider an allow-list or a skip for `noreply` addresses before relying on it.
