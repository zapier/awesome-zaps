---
name: post-one-time-codes-from-email-to-api-endpoint
description: Build a Zapier Next Gen Zap that watches Gmail for one-time security codes from a vendor, pulls the code out of the email and POSTs it as JSON to a verification endpoint, without passing on inbox IDs. Use when account provisioning or a sign-up flow waits on an emailed code and someone currently copies it by hand.
metadata:
  author: zapier
  summary: "When a one-time code arrives by email, it is pulled out and sent straight to your verification endpoint, so provisioning finishes without anyone copying codes by hand."
  apps: "Gmail, Webhooks by Zapier"
  category: "Data & Analytics"
  job: "Data integration"
  source: "https://zapier.com/automations/data-analytics/data-integration/api-integration/post-one-time-codes-from-email-to-api-endpoint"
---

# Post one-time codes from email to an API endpoint

## What it does

1. **Trigger:** Gmail, New Email Matching Search, with a sender + subject search for the vendor's code emails.
2. **Filter (code):** continues only if the email is from the vendor's sender address or the body contains a code-like pattern. Anything else stops with `skipped: not-a-code-email`.
3. **Extract (code):** finds the code in the plain-text body: first a number of 4–8 digits within 40 characters after "code", "passcode", "OTP" or "PIN"; otherwise any bare 6-digit number.
4. **Webhooks by Zapier** POSTs JSON to the endpoint: `code`, `extraction` (`matched` or `failed`), `source_sender`, `source_subject`, `source_received_at`. If no code was found, `code` is empty and the full plain-text `body` is sent instead. Gmail message and thread IDs are never sent.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Gmail, New Email Matching Search (`gmail`, `search`). Its `authentication_id` is the user's Gmail connection ID. Params: `query`, a Gmail search such as `from:codes@example.com subject:"verification code"`.
2. **Connections:** none in the code. Webhooks by Zapier (`webhook`) needs no connection; Gmail is used only by the trigger, through its `authentication_id`.
3. **Constants:**
   - `ENDPOINT_URL`: the verification endpoint that accepts a JSON POST.
   - `VENDOR_SENDER`: the vendor's sender address; use the same address as the trigger's `from:` search.
   - `MIN_CODE_LENGTH`, `MAX_CODE_LENGTH`: the code length in digits. Default 4 and 8.
4. Test with the steps below, then publish and wait until the trigger is active.

## Ask the user

- Which Gmail account receives the codes?
- Which address sends the codes, and what does the subject usually say? These make the trigger search and `VENDOR_SENDER`.
- What is the endpoint URL? Does it need auth headers or different field names than `code`, `source_sender`, `source_subject`, `source_received_at`? If so, change the POST step before installing.
- Are the codes digits only? Alphanumeric codes need a different pattern.

## Test

Send an email to the connected Gmail account itself with a subject matching the trigger search, sample the trigger, and run the record as a draft test run (`run_workflow_draft` in Zapier MCP). Point `ENDPOINT_URL` at an echo endpoint such as `https://httpbin.org/post` for the test. The sample used:

```json
{
  "message_id": "1a18…",
  "thread_id": "1a18…",
  "from": { "name": "", "email": "you@example.com" },
  "subject": "[install-test] Your verification code",
  "body_plain": "Hi,\n\nYour one-time verification code is: 482913\n\nThis code expires in 10 minutes. If you didn't request it, ignore this email.\n\n-- Install Test Vendor\r\n\r\n",
  "date": "Thu, 29 Oct 2026 16:52:16 -0700"
}
```

Confirm that the run output's `response.json` echoes `code: "482913"`, `extraction: "matched"` and the sender, subject and date, and contains no message or thread ID. Then set `ENDPOINT_URL` to the real endpoint before publishing.

## Customize

- **Alert on failed extraction:** send a team notification or create a ticket when `extraction` is `failed`.
- **High volume:** send codes to a queueing service instead of posting directly to the endpoint.

## Notes

- Gmail's search trigger also matches sent mail; add `in:inbox` to the search to ignore it.
- The bare 6-digit fallback can pick up other numbers (order IDs, dates such as `202610`) in emails that pass the filter by sender alone. Keep the trigger search narrow.
- The POST step retries on failure, which can post the same code twice. Make the endpoint idempotent on the code.
- Never commit a real endpoint URL. One-time codes are sensitive; send them only to an HTTPS endpoint you control.
