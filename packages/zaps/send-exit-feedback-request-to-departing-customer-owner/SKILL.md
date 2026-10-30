---
name: send-exit-feedback-request-to-departing-customer-owner
description: Build a Zapier Next Gen Zap that sends a personalized exit-feedback email to a customer as soon as their cancellation arrives by webhook, copying your retention inbox if you want. Use when a subscription or membership business wants to ask why a customer left, right away, without someone writing the email by hand.
metadata:
  author: zapier
  summary: "When a membership cancellation comes in, the departing customer gets a short, personal email asking what could have been better, with a link to your feedback form."
  apps: "Webhooks by Zapier, Microsoft Outlook"
  category: "Customer Service & Success"
  job: "Customer experience management"
  source: "https://zapier.com/automations/customer-service-success/customer-experience-management/customer-feedback-management/send-exit-feedback-request-to-departing-customer-owner"
---

# Send exit feedback request to departing customer owner

## What it does

1. **Trigger:** a cancellation notice arrives at a Webhooks by Zapier catch hook (the billing system posts to it).
2. The payload's customer email is trimmed and lowercased. If it is missing, the run stops and sends nothing.
3. The first name, the cancellation date and the customer's reason are tidied into the email. The feedback link is the payload's `feedback_url`, or `FEEDBACK_FORM_URL` if the payload has none.
4. **Microsoft Outlook** sends the email to the customer, from the connected Outlook account. The retention inbox is copied only if `RETENTION_INBOX_CC` is set.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `microsoft-outlook`: the user's Microsoft Outlook connection, for the account that sends the feedback email.
3. **Constants:**
   - `FEEDBACK_FORM_URL`: the link to the feedback survey, used when the payload has no `feedback_url`.
   - `RETENTION_INBOX_CC`: an address to copy on every email. Leave it empty to send to the customer only.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the webhook URL to point their billing system at.

## Ask the user

- Which Outlook account sends the email? (The Outlook connection is not set up on the account this was built in, so connect it first.)
- What is the feedback survey link?
- Should the retention inbox be copied on each email? If so, which address?
- What does the billing system send? The workflow reads these top-level fields: `customer_email`, `customer_name`, `owner_name`, `cancellation_reason`, `cancelled_at`, `submission_id` and `feedback_url`. If the sender uses other names, change the schema to match before installing.

## Test

When the Outlook connection exists, run this sample as a draft test (`run_workflow_draft` in Zapier MCP) before publishing. Use the address of the connected Outlook account as the customer email, so the test email goes only to you:

```json
{
  "customer_email": "YOUR_OUTLOOK_ADDRESS",
  "customer_name": "Test Customer",
  "owner_name": "Retention Team",
  "cancellation_reason": "Too expensive for what I use",
  "cancelled_at": "2026-10-29T10:15:00Z",
  "submission_id": "TEST-0001",
  "feedback_url": "https://example.com/feedback-test"
}
```

Check that one email arrived in the connected Outlook inbox, addressed to the customer's first name, with the cancellation date and reason in the body and the feedback link at the end. Then delete the test email.

## Customize

- **Add a CRM update** that marks the subscription canceled and tags it for nurture.
- **Route responses** to a retention channel, or create a follow-up task for the account owner.

## Notes

- Nothing is deduplicated. If the billing system can send the same cancellation twice, the customer gets two emails. A submission-ID check needs a place to store IDs, which this version does not have.
- The email is sent immediately on receipt, as the spec asks.
- Never commit a real feedback link, retention inbox address or webhook URL. Anyone with the webhook URL can trigger an email to whatever address they send.
