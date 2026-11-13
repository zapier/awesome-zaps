---
name: send-templated-meeting-reply-sms-to-client-texts
description: Build a Zap on Zapier that sends a templated meeting reply by SMS from a Quo number when a client texts back a reply code, with the template text looked up in a Zapier Table. Use when a business texts clients to confirm or reschedule meetings and wants the matching reply sent automatically.
license: MIT
metadata:
  author: zapier
  summary: "When a client texts back a reply code, they get the matching meeting reply by SMS straight away, so scheduling needs no manual follow-up."
  apps: "Quo, Zapier Tables"
  category: "Personal Productivity"
  job: "Communication management"
  source: "https://zapier.com/automations/personal-productivity/communication-management/sms-automation/send-templated-meeting-reply-sms-to-client-texts"
---

# Send templated meeting reply SMS to client texts

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-templated-meeting-reply-sms-to-client-texts. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new incoming message arrives in Quo (`quo`, `new_incoming_message`) on the Quo number clients text.
2. **Filter (in code):** the message continues only if its text, trimmed, is a qualifying reply code (`1`, `2`, `3` by default). Anything else stops the run and sends nothing.
3. **Zapier Tables** finds the record in the templates table whose `identifier` matches the reply code and reads its `body`. If there is no match, the fallback reply is used.
4. **Quo** sends an SMS with that text to the number the client texted from, from the business number.

Only a qualifying reply sends anything, and no template is ever created automatically.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                            | What goes there                                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_BUSINESS_PHONE_NUMBER_ID` | The Quo number replies are sent from (the business number), looked up with Quo's phone number list                              |
| `REPLACE_TEMPLATES_TABLE_ID`       | The Zapier Table with the reply templates. It needs `identifier` (the reply code, such as `1`) and `body` (the SMS text) fields |

Also ask which Quo number clients text, and set it as the trigger's phone number.

Review the defaults with them: `QUALIFYING_REPLIES` at the top of `workflow.ts` (`1`, `2`, `3`), and `FALLBACK_REPLY` in `config.ts`, the text sent when no template matches.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `quo` (sends the SMS and provides the trigger) and `zapier-tables` (reads the templates table) to the user's connections.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-incoming-message.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's phone number to the Quo number clients text. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match. In particular, confirm the lookup-value key of the `find_record` action (`value_1` in `workflow.ts`).

## Test it

Run it once as a draft test with this sample input, with `from` set to your own mobile number so the test reply only reaches you:

```json
{
  "id": "msg_test_001",
  "from": "+15555550123",
  "body": "1"
}
```

Check that:

- a reply of `1` finds the template whose `identifier` is `1` and sends its `body` from your business number to `from`;
- a message such as `hello` stops the run and sends nothing;
- a reply code with no matching template sends the fallback reply instead.

If run-status tools aren't available, check the result in Quo directly. Then ask the user to delete the test messages; the agent doesn't delete them.

## Notes

- The filter and the body lookup are plain code between steps, not separate Zapier steps.
- To extend it: append a calendar or payment link to confirmed replies, or add a CRM step after a confirmation to tag the contact.
- Don't commit a real phone number, table ID or sender ID.
