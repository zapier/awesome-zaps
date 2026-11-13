---
name: add-sms-opt-ins-from-incoming-replies-to-consent-tracker
description: Build a Zap on Zapier that turns each incoming SMS opt-in reply (YES, START, JOIN and similar) into a consent record in an Airtable table, with the sender number normalized to E.164. Use when a business collects SMS consent by keyword reply and needs a compliant record of who opted in, when, and from which message.
license: MIT
metadata:
  author: zapier
  summary: "When someone texts an opt-in keyword to your number, they get a consent record in your Airtable tracker with their phone number, name and original reply, so you can prove consent later."
  apps: "Webhooks by Zapier, Airtable"
  category: "Legal"
  job: "Privacy compliance"
  source: "https://zapier.com/automations/legal/privacy-compliance/consent-management/add-sms-opt-ins-from-incoming-replies-to-consent-tracker"
---

# Add SMS opt-ins from incoming replies to consent tracker

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/add-sms-opt-ins-from-incoming-replies-to-consent-tracker. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** an SMS reply arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). Your SMS provider or form posts the reply to it.
2. **Opt-in check (code, no app call):** the first word of the reply must be an opt-in keyword (`YES`, `Y`, `START`, `UNSTOP`, `SUBSCRIBE`, `JOIN`, case-insensitive). Anything else ends the run with no write.
3. **Phone check (code):** the sender number is normalized to E.164. A number with fewer than 8 digits ends the run with no write.
4. **Airtable** creates one record in the consent table: normalized phone, the name typed after the keyword (if any), the raw reply, the opt-in box ticked, and the submission ID from the payload.

The Zap writes a record only when a reply starts with an opt-in keyword, and it never sends a message to the sender.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting               | What goes there                                                         |
| --------------------- | ----------------------------------------------------------------------- |
| `AIRTABLE_BASE_ID`    | The Airtable base that holds consent records (its ID starts with `app`) |
| `AIRTABLE_TABLE_NAME` | The table in that base that holds consent records                       |

Also review the defaults with them: the Airtable field names in `config.ts` (`PHONE_FIELD`, `NAME_FIELD`, `NOTES_FIELD`, `OPT_IN_FIELD`, `SUBMISSION_ID_FIELD`; `OPT_IN_FIELD` must be a checkbox), `DEFAULT_COUNTRY_CODE` (`+1`, set it to their market's code) and `OPT_IN_KEYWORDS` in `workflow.ts`.

Consent questions to confirm:

- Are `YES`, `Y`, `START`, `UNSTOP`, `SUBSCRIBE` and `JOIN` the right opt-in words for your program?
- What does the SMS provider send in the payload? The Zap reads `message_body`, `sender_number` and `submission_id`; if the provider uses other names, change the `InputSchema` keys in `workflow.ts` before publishing.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `airtable` to the user's Airtable connection for the account that owns the consent table. The Webhooks by Zapier catch hook needs no connection, so its `authentication_id` is `null`.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with the Airtable table set to one the user controls. First a reply without an opt-in keyword:

```json
{
  "message_body": "[install-test] maybe later",
  "sender_number": "+1 555 010 0100",
  "submission_id": "[install-test]-skip-1"
}
```

Expected: the run ends with `skipped: true, reason: "no-opt-in-keyword"` and writes nothing to Airtable.

Then a qualifying reply with the same shape and `message_body` set to `"YES [install-test] Jane Tester"`. Expected: one new record with phone `+15550100100`, name `[install-test] Jane Tester`, notes equal to the reply, and the opt-in box ticked.

If run-status tools aren't available, check the result in Airtable directly. Ask the user to delete the test row; the agent doesn't delete test data.

Then publish, confirm the trigger is active, and give the user the webhook URL to point their SMS provider at.

## Notes

- Only the first word of a reply is checked for opt-in. A reply that says "I'd like to join" does not count.
- The payload's timestamp is not written to Airtable. Add a timestamp field and map it if the consent table needs one.
- Anyone who can reach the catch-hook URL can create consent records, so keep that URL private.
- To update existing contacts instead of creating records, add a CRM lookup step. To alert the team on VIP opt-ins, add a message step after the Airtable step.
- Never commit a real base ID, table name or webhook URL.
