---
name: send-templated-meeting-reply-sms-to-client-texts
description: Use when a business texts clients to confirm or reschedule meetings and wants the matching reply sent automatically when a client answers with a reply code. Sends a templated meeting reply by SMS from a Quo number, with the template text looked up in a Zapier Table.
metadata:
  author: zapier
  summary: "When a client texts back a reply code, they get the matching meeting reply by SMS straight away, so scheduling needs no manual follow-up."
  apps: "Quo, Zapier Tables"
  category: "Personal Productivity"
  job: "Communication management"
  source: "https://zapier.com/automations/personal-productivity/communication-management/sms-automation/send-templated-meeting-reply-sms-to-client-texts"
---

# Send templated meeting reply SMS to client texts

## What it does

1. **Trigger:** a new incoming message arrives in Quo (`new_incoming_message`) on the phone number you choose.
2. **Filter (in code):** the message continues only if its text, trimmed, is one of the qualifying reply codes (`1`, `2`, `3` by default). Anything else stops the run and sends nothing.
3. **Zapier Tables** finds the record in your templates table whose `identifier` matches the reply code and reads its `body`. If there is no match, the fallback reply is used. No template is ever created automatically.
4. **Quo** sends an SMS with that text to the number the client texted from, using your business number.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**Trigger:** Quo, New Incoming Message (`quo` / `new_incoming_message`). Set its phone number to the Quo number clients text.

**Connections** (each alias in the code is the app's slug):

- `zapier-tables`: the Zapier Tables connection that can read the templates table.
- `quo`: the Quo connection that sends the SMS and provides the trigger.

**Constants:** set these at the top of `workflow.ts`:

- `BUSINESS_PHONE_NUMBER_ID`: the Quo number replies come from. Get its ID from Quo's "List Phone Numbers" action.
- `TEMPLATES_TABLE_ID`: the Zapier Table with the templates. It needs an `identifier` field (text, the reply code) and a `body` field (long text, the SMS).
- `QUALIFYING_REPLIES`: the reply codes that get a template. Defaults to `"1"`, `"2"`, `"3"`.
- `FALLBACK_REPLY`: the text sent when no template matches. Defaults to a short "we'll follow up shortly" reply.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before publishing. In particular, confirm the Zapier Tables lookup-value key used in the `find_record` action.

## Ask the user

- Which Quo number do clients text, and which number should replies come from?
- Which Zapier Table holds the templates, and do its fields match `identifier` and `body`?
- Which reply codes should get a template? The default is `1`, `2` and `3`.
- What should the fallback reply say?

## Test

Send this as the trigger's sample input in a draft test run, with `from` set to your own mobile number so the test reply only reaches you:

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

## Customize

- **Append a calendar or payment link** to confirmed replies so the next step is one tap away.
- **Add a CRM step** after a confirmation to tag the contact in your CRM.

## Notes

- The filter and the body lookup are plain code between steps, not separate Zapier steps.
- Only the text of a qualifying reply triggers a send. Every other incoming message is ignored.
- Never commit a real phone number, table ID or sender ID. Replace the placeholders in `workflow.ts` with your own values.
