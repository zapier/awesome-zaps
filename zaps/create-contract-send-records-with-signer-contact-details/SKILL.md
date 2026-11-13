---
name: create-contract-send-records-with-signer-contact-details
description: Build a Zap on Zapier that adds one row per signer to a Zapier Table each time a Dropbox Sign signature request is sent, with the signer's name, email, sent time and request ID. Use when a legal, contracts or operations team wants an auditable, searchable record of every outbound signature request and who it went to.
license: MIT
metadata:
  author: zapier
  summary: "Every contract you send for signature gets a row per signer in your table, with their contact details and request ID, so you can search who was sent what."
  apps: "Dropbox Sign, Zapier Tables"
  category: "Legal"
  job: "Contract management"
  source: "https://zapier.com/automations/legal/contract-management/contract-documentation-management/create-contract-send-records-with-signer-contact-details"
---

# Create contract send records with signer contact details

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-contract-send-records-with-signer-contact-details. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a signature request is sent in Dropbox Sign (`dropbox-sign`, `signature_request_sent`).
2. **Zapier Tables** looks for a row with the same signer email and signature request ID. If one exists, the run skips that signer, so a repeated event does not duplicate a row.
3. **Zapier Tables** creates one row per signer that has no match: contact name, contact email, sent at, and signature request ID.

Each signer gets their own row for each request. The run returns which signers were created, which already existed, and which failed, so one bad signer does not stop the others.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting            | What goes there                                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `REPLACE_TABLE_ID` | The Zapier Tables table that holds the signer records, looked up by name with the user's Zapier Tables connection |

Also check with them:

- Does the table have four fields in this order: contact name, contact email, sent at (date and time), and signature request ID? The code writes them as `f1` to `f4`, so create the table that way, or change the field keys in `workflow.ts` to match.
- Which Dropbox Sign account sends the signature requests? If it has more than one connection, which one?
- Should a signer who already has a row for the same request be skipped? That is the default here. Change `workflow.ts` only if they want a new row every time.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `dropbox-sign` to the user's Dropbox Sign connection for the account that sends the signature requests (the trigger uses it), and `zapier-tables` to their Zapier Tables connection for the table that holds the signer records.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/signature-request-sent.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the Zapier Tables actions' fields with the user's connection and sample the Dropbox Sign trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run before publishing, against a test table so no real records are touched:

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

If run-status tools aren't available, check the result in Zapier Tables directly. The user deletes the test rows.

## Notes

- Dropbox Sign's trigger payload can deliver signers as a single value or as a list. The code handles both, and pairs names and emails by position.
- The sent-at value is the time the workflow ran, because the trigger payload has no event time field that could be mapped here.
- To match emails regardless of case or spacing, add a Formatter or Email step before the match, so `Jane@Example.com` and `jane@example.com` count as the same signer.
- To record signed copies, extend the workflow to append the signed PDF link when a Signature Request Completed trigger fires.
- Never commit a real table ID or a real signer's details to a shared copy of this file.
