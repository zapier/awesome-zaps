---
name: send-new-email-contents-to-intake-endpoint-for-processing
description: Build a Zapier Next Gen Zap that posts each new email in a Gmail inbox (subject, plain-text body, sender and message ID) as JSON to your intake endpoint, so a ticketing or processing system can turn it into a ticket. Use when a support or operations inbox should feed a ticket queue or processing pipeline automatically, and you have an HTTP endpoint that accepts JSON.
metadata:
  author: zapier
  summary: "Every new email to your support inbox is sent as structured data to your intake system, so it can become a ticket without anyone copying it by hand."
  apps: "Gmail, Webhooks by Zapier"
  category: "Customer Service & Success"
  job: "Omnichannel support"
  source: "https://zapier.com/automations/customer-service-success/omnichannel-support/email-to-ticket-conversion/send-new-email-contents-to-intake-endpoint-for-processing"
---

# Send new email contents to intake endpoint for processing

## What it does

1. **Trigger:** Gmail, New Email, in the Inbox. Each new message fires a run with its subject, plain-text body, sender and message ID.
2. **Filter (built as code, not a step):** optional keyword and sender filters. Both are empty by default, so every email is forwarded.
3. **Webhooks by Zapier, POST:** sends JSON `{ subject, message, sender, message_id }` to your intake endpoint. The subject maps to `subject`, the plain body to `message`, and the sender address to `sender`.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top.

1. **Trigger:** Gmail, New Email (`gmail`, `message`). Set the trigger's mailbox to **Inbox** (`label_ids: "INBOX"`). Left unset, it fires on every email, including drafts.
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the Gmail account that receives the inbox to be processed.
   - Webhooks by Zapier (`webhook`) needs no connection.
3. **Constants:**
   - `INTAKE_ENDPOINT_URL`: the URL of your intake endpoint. It must accept JSON POSTs.
   - `ROUTING_KEYWORDS`: optional. Forward only emails containing one of these words. Empty forwards all emails.
   - `MONITORED_SENDERS`: optional. Forward only emails from these addresses. Empty forwards all senders.
4. Test with the sample below, then publish, confirm the trigger is active, and give the user the trigger's webhook details if the trigger exposes them. Nothing fires until the Gmail trigger sees mail.

## Ask the user

- Which Gmail account and mailbox should be watched? The default is the account's Inbox.
- What is the intake endpoint URL? It must accept a JSON POST with `subject`, `message`, `sender` and `message_id`.
- Should only some emails go through? If so, which keywords or sender addresses? Leave both empty to forward everything.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Point `INTAKE_ENDPOINT_URL` at a test endpoint first, not the production intake:

```json
{
  "subject": "[install-test] Sample support request",
  "body_plain": "[install-test] Sample body: my order has not arrived.",
  "from": {
    "email": "install-test-sender@example.com",
    "name": "Install Test"
  },
  "message_id": "install-test-msg-001"
}
```

Check: the run completes, and the endpoint receives a JSON body whose `subject`, `message`, `sender` and `message_id` match the sample. Read the body back from the run's step result (`get_run_output` with `include_results: true`), not from the run status alone.

## Customize

- **Strip signatures or extract fields:** add a Formatter step, or plain JavaScript in the workflow, to clean `message` or pull out order numbers before the POST.
- **Route by subject:** post to different endpoints based on keywords or detected request type, using separate POST steps or a `switch` on subject text.

## Notes

- Deduplication by Message-ID is not built. A durable workflow has no store to remember past IDs. Gmail's trigger does not re-deliver the same message, but a retry of a failed POST can send it twice.
- `from` arrives as an object (`{ name, email }`). The workflow reads `email`. If the trigger sends a plain string, that is handled too.
- The POST sends the email body as-is, so its contents go to your intake endpoint. Use an endpoint you trust, and HTTPS.
- Do not commit a real intake endpoint URL. Anyone with it can submit tickets.
