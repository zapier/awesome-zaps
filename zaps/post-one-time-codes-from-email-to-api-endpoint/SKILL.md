---
name: post-one-time-codes-from-email-to-api-endpoint
description: Build a Zap on Zapier that watches Gmail for one-time security codes from a vendor, pulls the code out of the email and POSTs it as JSON to a verification endpoint, without passing on inbox IDs. Use when account provisioning or a sign-up flow waits on an emailed code and someone currently copies it by hand.
license: MIT
metadata:
  author: zapier
  summary: "When a one-time code arrives by email, it is pulled out and sent straight to your verification endpoint, so provisioning finishes without anyone copying codes by hand."
  apps: "Gmail, Webhooks by Zapier"
  category: "Data & Analytics"
  job: "Data integration"
  source: "https://zapier.com/automations/data-analytics/data-integration/api-integration/post-one-time-codes-from-email-to-api-endpoint"
---

# Post one-time codes from email to an API endpoint

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/post-one-time-codes-from-email-to-api-endpoint. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** Gmail, New Email Matching Search (`gmail`, `search`), with a sender + subject search (`query`) for the vendor's code emails.
2. **Filter (code):** continues only if the email is from the vendor's sender address or the body contains a code-like pattern. Anything else stops with `skipped: not-a-code-email`.
3. **Extract (code):** finds the code in the plain-text body: first a number of 4–8 digits within 40 characters after "code", "passcode", "OTP" or "PIN"; otherwise any bare 6-digit number.
4. **Webhooks by Zapier** (`webhook`) POSTs JSON to the endpoint: `code`, `extraction` (`matched` or `failed`), `source_sender`, `source_subject`, `source_received_at`. If no code was found, `code` is empty and the full plain-text `body` is sent instead. Gmail message and thread IDs are never sent.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                | Where                                | What goes there                                                                                                                           |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `ENDPOINT_URL`         | `config.ts`                          | The verification endpoint's URL: the HTTPS address that accepts the code as a JSON POST                                                   |
| `VENDOR_SENDER`        | `config.ts`                          | The vendor's sender address. Emails from it always pass the filter; others pass only if a code is found                                   |
| `REPLACE_GMAIL_SEARCH` | `triggers/search.ts`, `params.query` | The Gmail search that finds the vendor's code emails, such as `from:<sender> subject:"<subject>"`. Use the same sender as `VENDOR_SENDER` |

Also review these with them:

- The code is digits only, and `MIN_CODE_LENGTH` and `MAX_CODE_LENGTH` in `workflow.ts` (4 and 8) set its length. Alphanumeric codes need a different pattern.
- Does the endpoint need auth headers, or different field names than `code`, `source_sender`, `source_subject` and `source_received_at`? If so, change the POST step before installing.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` (the Gmail account that receives the codes) to the user's Gmail connection. Only the trigger uses it; the workflow itself uses no connection alias. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/search.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with `ENDPOINT_URL` set to an echo endpoint such as `https://httpbin.org/post`. Send an email to the connected Gmail account itself with a subject matching the trigger search, then sample the trigger and run this record:

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

Check that the run output's `response.json` echoes `code: "482913"`, `extraction: "matched"` and the sender, subject and date, and contains no message or thread ID. If run-status tools aren't available, check the result in the echo endpoint directly. Ask the user to delete the test email; the agent doesn't delete test data. Then set `ENDPOINT_URL` to the real endpoint, publish, and confirm the trigger is active.

## Notes

- Gmail's search also matches sent mail. Add `in:inbox` to the search to ignore it.
- The bare 6-digit fallback can pick up other numbers (order IDs, dates such as `202610`) in emails that pass the filter by sender alone. Keep the search narrow.
- The POST step retries on failure, which can post the same code twice. Make the endpoint idempotent on the code.
- Never commit a real endpoint URL. One-time codes are sensitive; send them only to an HTTPS endpoint you control.
- To alert on failed extraction, send a team notification or create a ticket when `extraction` is `failed`. For high volume, queue codes instead of posting them directly to the endpoint.
