---
name: create-contract-send-records-with-signer-contact-details
description: Build a Zapier Next Gen Zap that adds one row per signer to a Zapier Table each time a Dropbox Sign signature request is sent, with the signer's name, email, sent time and request ID. Use when a legal, contracts or operations team wants an auditable, searchable record of every outbound signature request and who it went to.
metadata:
  author: zapier
  summary: "Every contract you send for signature gets a row per signer in your table, with their contact details and request ID, so you can search who was sent what."
  apps: "Dropbox Sign, Zapier Tables"
  category: "Legal"
  job: "Contract management"
  source: "https://zapier.com/automations/legal/contract-management/contract-documentation-management/create-contract-send-records-with-signer-contact-details"
---

# Create contract send records with signer contact details

## What it does

1. **Trigger:** a signature request is sent in Dropbox Sign (Signature Request Sent).
2. **Zapier Tables** looks for a row with the same signer email and signature request ID. If one exists, the run skips that signer, so a repeated event does not duplicate a row.
3. **Zapier Tables** creates one row per signer that has no match: contact name, contact email, sent at, and signature request ID.

Each signer gets their own row for each request. The run returns which signers were created, which already existed, and which failed, so one bad signer does not stop the others.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Dropbox Sign, Signature Request Sent (`dropbox-sign`, `signature_request_sent`). It needs a Dropbox Sign connection, so its `authentication_id` is that connection's ID.
2. **Connections** (each alias in the code is the app's slug):
   - `zapier-tables`: the Zapier Tables connection for the table that holds the signer records.
   - `dropbox-sign`: the Dropbox Sign connection for the account that sends the signature requests.
3. **Constants:**
   - `TABLE_ID`: the Zapier Tables table to write to. Copy the ID from the table's URL.
   - The table needs four fields: a contact name, a contact email, a sent-at date and time, and a signature request ID. The code writes to them as `f1` to `f4` in that order, so create the table with those fields in that order, or change the field keys in the code to match.

## Ask the user

- Which Zapier table holds the signer records, and do its four fields match the order above?
- Which Dropbox Sign account sends the signature requests? If it has more than one connection, which one?
- Should a signer who already has a row for the same request be skipped (the default here), or should it always get a new row?

## Test

Run this sample as a draft test run before publishing (`run_workflow_draft` in Zapier MCP), using a test table so no real records are touched:

```json
{
  "signatures[]signer_name": ["Jane Test", "Sam Test"],
  "signatures[]signer_email_address": [
    "jane.test@example.com",
    "sam.test@example.com"
  ],
  "signature_request_id": "sr_test_20261029"
}
```

Check that:

- The table gains two new rows, one per signer, each with the name, email, a sent-at time and the request ID `sr_test_20261029`.
- Running the same sample a second time adds no rows, because both signers already have a row for that request.
- The run's output lists both signers under `created` on the first run and under `existing` on the second.

Then delete the test rows.

## Customize

- **Normalize emails before matching:** add a Formatter or Email step to trim and lowercase email addresses before the match, so `Jane@Example.com` and `jane@example.com` count as the same signer.
- **Record signed copies:** extend the workflow to append the signed PDF link when a Signature Request Completed trigger fires.

## Notes

- Dropbox Sign's trigger payload can deliver signers as a single value or as a list. The code handles both, and pairs names and emails by position.
- The sent-at value is the time the workflow ran, because the trigger payload has no event time field that could be mapped here.
- Never commit a real table ID or a real signer's details to a shared copy of this file.
