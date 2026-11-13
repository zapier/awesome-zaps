---
name: send-new-email-contents-to-intake-endpoint-for-processing
description: Build a Zap on Zapier that posts each new email in a Gmail inbox (subject, plain-text body, sender and message ID) as JSON to your intake endpoint, so a ticketing or processing system can turn it into a ticket. Use when a support or operations inbox should feed a ticket queue or processing pipeline automatically, and you have an HTTP endpoint that accepts JSON.
license: MIT
metadata:
  author: zapier
  summary: "Every new email to your support inbox is sent as structured data to your intake system, so it can become a ticket without anyone copying it by hand."
  apps: "Gmail, Webhooks by Zapier"
  category: "Customer Service & Success"
  job: "Omnichannel support"
  source: "https://zapier.com/automations/customer-service-success/omnichannel-support/email-to-ticket-conversion/send-new-email-contents-to-intake-endpoint-for-processing"
---

# Send new email contents to intake endpoint for processing

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-new-email-contents-to-intake-endpoint-for-processing. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** Gmail, New Email (`gmail`, `message`). Each new message fires a run with its subject, plain-text body, sender and message ID.
2. **Filter (built as code, not a step):** optional keyword and sender filters. Both are empty by default, so every email is forwarded.
3. **Webhooks by Zapier, POST:** sends JSON `{ subject, message, sender, message_id }` to your intake endpoint. The subject maps to `subject`, the plain body to `message`, and the sender address to `sender`.

The Zap only forwards. Its one action is that POST, and nothing is written back to Gmail.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                       | What goes there                                                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_INTAKE_ENDPOINT_URL` | The URL of the intake endpoint (`config.ts`). It must accept a JSON POST with `subject`, `message`, `sender` and `message_id`. Use a test endpoint for the first run. |

Also review the defaults with them:

- **Mailbox:** the trigger watches the Gmail Inbox (`label_ids: "INBOX"`, set in step 2 of Build it). Left unset, it fires on every email, including drafts.
- **`ROUTING_KEYWORDS`** (in `workflow.ts`): optional. Forward only emails containing one of these words. Empty forwards every email.
- **`MONITORED_SENDERS`** (in `workflow.ts`): optional. Forward only emails from these addresses. Empty forwards from any sender.

Questions to settle: which Gmail account receives the inbox to be processed, and whether only some emails should go through (and if so, which keywords or sender addresses).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` to the user's Gmail connection for the account that receives the inbox to be processed. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/message.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's mailbox to Inbox (`label_ids: "INBOX"`). The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Point `REPLACE_INTAKE_ENDPOINT_URL` at a test endpoint first, not the production intake:

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

Check that the run completes, and that the endpoint receives a JSON body whose `subject`, `message`, `sender` and `message_id` match the sample. Read the body back from the run's step result (`get_run_output` with `include_results: true`), not from the run status alone. If run-status tools aren't available, check the result in your intake endpoint directly. Ask the user to delete the test data; the agent doesn't. Then publish, confirm the trigger is active, and note that nothing fires until the Gmail trigger sees mail.

## Notes

- Deduplication by Message-ID is not built: a durable workflow has no store of past IDs. Gmail does not re-deliver the same message, but a retry of a failed POST can send it twice.
- `from` arrives as an object (`{ name, email }`), and the workflow reads `email`. A plain string is handled too.
- The POST sends the email body as-is, so use an endpoint you trust, over HTTPS. Don't commit a real intake endpoint URL; anyone with it can submit tickets.
- To customize: strip signatures or pull out order numbers with a Formatter step or plain JavaScript before the POST, or route by subject to different endpoints with separate POST steps or a `switch`.
