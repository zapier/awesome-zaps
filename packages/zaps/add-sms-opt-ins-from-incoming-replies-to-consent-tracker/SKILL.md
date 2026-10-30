---
name: add-sms-opt-ins-from-incoming-replies-to-consent-tracker
description: Build a Zapier Next Gen Zap that turns each incoming SMS opt-in reply (YES, START, JOIN and similar) into a consent record in an Airtable table, with the sender number normalized to E.164. Use when a business collects SMS consent by keyword reply and needs a compliant record of who opted in, when, and from which message.
metadata:
  author: zapier
  summary: "When someone texts an opt-in keyword to your number, they get a consent record in your Airtable tracker with their phone number, name and original reply, so you can prove consent later."
  apps: "Webhooks by Zapier, Airtable"
  category: "Legal"
  job: "Privacy compliance"
  source: "https://zapier.com/automations/legal/privacy-compliance/consent-management/add-sms-opt-ins-from-incoming-replies-to-consent-tracker"
---

# Add SMS opt-ins from incoming replies to consent tracker

## What it does

1. **Trigger:** an SMS reply arrives at a Webhooks by Zapier catch hook (your SMS provider or form posts the reply to it).
2. **Opt-in check (code, no app call):** the first word of the reply must be an opt-in keyword (`YES`, `Y`, `START`, `UNSTOP`, `SUBSCRIBE`, `JOIN`, case-insensitive). Anything else ends the run with no write.
3. **Phone check (code):** the sender number is normalized to E.164. A number with fewer than 8 digits ends the run with no write.
4. **Airtable** creates one record in your consent table: normalized phone, the name typed after the keyword (if any), the raw reply, the opt-in box ticked, and the submission ID from the payload.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook` / `hook_v2`). No connection, so `authentication_id` is `null`.
2. **Connections** (the alias in the code is the app's slug):
   - `airtable`: the Airtable account that owns the consent table.
3. **Constants:**
   - `AIRTABLE_BASE_ID`: the base's ID, starts with `app`.
   - `AIRTABLE_TABLE_NAME`: the table that holds consent records.
   - `PHONE_FIELD`, `NAME_FIELD`, `NOTES_FIELD`, `OPT_IN_FIELD`, `SUBMISSION_ID_FIELD`: the Airtable field names. `OPT_IN_FIELD` must be a checkbox.
   - `DEFAULT_COUNTRY_CODE`: added to 10-digit numbers sent without a `+`. Set it to your market's code.
   - `OPT_IN_KEYWORDS`: the reply words that count as consent.
4. Test with the steps below, then publish, confirm the trigger is active, and give the user the webhook URL to point their SMS provider at.

## Ask the user

- Which Airtable base and table hold consent records, and what are the field names for phone, name, notes, opt-in and submission ID?
- What does the SMS provider send in the payload? The template reads `message_body`, `sender_number` and `submission_id`; if the provider uses other names, change the `InputSchema` keys before installing.
- Are `YES`, `Y`, `START`, `UNSTOP`, `SUBSCRIBE` and `JOIN` the right opt-in words for your program, and is the default country code `+1`?

## Test

```json
{
  "message_body": "[install-test] maybe later",
  "sender_number": "+1 555 010 0100",
  "submission_id": "[install-test]-skip-1"
}
```

Expected: the run ends with `skipped: true, reason: "no-opt-in-keyword"` and writes nothing to Airtable.

Then a qualifying reply with the same shape and `message_body` set to `"YES [install-test] Jane Tester"`. Expected: one new record with phone `+15550100100`, name `[install-test] Jane Tester`, notes equal to the reply, and the opt-in box ticked. Then delete that test row, since it was created for testing.

## Customize

- **Add a CRM lookup step** to update existing contacts instead of creating new records.
- **Send an internal notification** to your team channel for VIP or high-priority opt-ins.

## Notes

- Only the first word of a reply is checked for opt-in. A reply that says "I'd like to join" does not count.
- The payload's timestamp is not written to Airtable; the spec's field mapping has no timestamp field. Add one if your consent table needs it.
- Anyone who can reach the catch-hook URL can create consent records, so keep that URL private.
- Never commit a real base ID, table name or webhook URL.
