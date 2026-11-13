---
name: send-exit-feedback-request-to-departing-customer-owner
description: Build a Zap on Zapier that sends a personalized exit-feedback email to a customer as soon as their cancellation arrives by webhook, copying your retention inbox if you want. Use when a subscription or membership business wants to ask why a customer left, right away, without someone writing the email by hand.
license: MIT
metadata:
  author: zapier
  summary: "When a membership cancellation comes in, the departing customer gets a short, personal email asking what could have been better, with a link to your feedback form."
  apps: "Webhooks by Zapier, Microsoft Outlook"
  category: "Customer Service & Success"
  job: "Customer experience management"
  source: "https://zapier.com/automations/customer-service-success/customer-experience-management/customer-feedback-management/send-exit-feedback-request-to-departing-customer-owner"
---

# Send exit feedback request to departing customer owner

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-exit-feedback-request-to-departing-customer-owner. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a cancellation notice arrives at a catch hook (`webhook`, `hook_v2`). The billing system posts to it.
2. The payload's customer email is trimmed and lowercased. If it is missing, the run stops and sends nothing.
3. The first name, the cancellation date and the customer's reason are tidied into the email. The feedback link is the payload's `feedback_url`, or `FEEDBACK_FORM_URL` if the payload has none.
4. **Microsoft Outlook** sends the email to the customer, from the connected Outlook account. The retention inbox is copied only if `RETENTION_INBOX_CC` is set.

The zap sends one email per notice and nothing else.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                     | What goes there                                                            |
| --------------------------- | -------------------------------------------------------------------------- |
| `REPLACE_FEEDBACK_FORM_URL` | The feedback survey link, used when the cancellation has no `feedback_url` |

Also review the defaults with them: `RETENTION_INBOX_CC` (empty by default, so the email goes to the customer only; set it to an address to copy it on every email).

Then ask:

- Which Outlook account sends the email? Connect it first if the user's account doesn't have one.
- What does the billing system send? The workflow reads these top-level fields: `customer_email`, `customer_name`, `owner_name`, `cancellation_reason`, `cancelled_at`, `submission_id` and `feedback_url`. If the sender uses other names, change the schema to match before installing.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `microsoft-outlook` (the account that sends the feedback email) to the user's Microsoft Outlook connection. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test. Set `customer_email` to the address of the connected Outlook account, so the test email goes only to the user:

```json
{
  "customer_email": "<the connected Outlook address>",
  "customer_name": "Test Customer",
  "owner_name": "Retention Team",
  "cancellation_reason": "Too expensive for what I use",
  "cancelled_at": "2026-10-29T10:15:00Z",
  "submission_id": "TEST-0001",
  "feedback_url": "https://example.com/feedback-test"
}
```

Check that one email arrived in the connected Outlook inbox, addressed to the customer's first name, with the cancellation date and reason in the body and the feedback link at the end. If run-status tools aren't available, check the result in Outlook directly. Ask the user to delete the test email, not the agent. Then publish, confirm the trigger is active, and give the user the webhook URL to point their billing system at.

## Notes

- Nothing is deduplicated. If the billing system can send the same cancellation twice, the customer gets two emails. A submission-ID check needs a place to store IDs, which this version does not have.
- Anyone with the webhook URL can trigger an email to any address they send, so keep the URL private.
- To extend it: add a CRM update that marks the subscription canceled and tags it for nurture, or route responses to a retention channel or create a follow-up task for the account owner.
