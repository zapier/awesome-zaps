---
name: create-weight-log-record-from-client-sms-messages
description: Build a Zapier Next Gen Zap that logs each weight a client texts to your business phone number as a new row in a Zapier Table, timestamped with the sender's number and the original message, then texts the client back a confirmation with the logged weight. Use when a coach, clinic or wellness program collects weigh-ins by SMS and wants them in one central table without manual entry.
metadata:
  author: zapier
  summary: "When a client texts in their weight, it's logged as a timestamped row in your central table and they get a short text back confirming it."
  apps: "Quo, Zapier Tables"
  category: "Personal Productivity"
  job: "Health wellness tracking"
  source: "https://zapier.com/automations/personal-productivity/health-wellness-tracking/fitness-tracking-automation/create-weight-log-record-from-client-sms-messages"
---

# Create weight log record from client SMS messages

## What it does

1. **Trigger:** a new message arrives on your Quo phone number (Quo, formerly OpenPhone). The message text, the sender's number and the time it was sent are passed along.
2. **Weight:** the text is scanned for a number. Commas are removed, and the first number found is taken as the weight. If there is no number above zero, the run stops and nothing is written or sent.
3. **Zapier Tables** adds one new row to your weight log: the record date, the sender's phone number, the original message, and the weight.
4. **Quo** texts the sender back a short confirmation with the logged weight, from your Quo number.

Every qualifying message gets its own new row. Existing rows are never changed.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Quo, Incoming Message Received (`quo`, `new_incoming_message`). Set `resource_ids` to the Quo phone number clients text. It needs the user's Quo connection, so its `authentication_id` is that connection. The trigger payload's fields are `body` (message text), `from` (sender number) and `createdAt` (time sent).
2. **Connections** (each alias in the code is the app's slug):
   - `zapier-tables`: the user's Zapier Tables connection, for the account that owns the weight log table.
   - `quo`: the user's Quo connection, for the phone number that receives and sends the texts.
3. **Constants:**
   - `QUO_FROM_PHONE_NUMBER_ID`: the Quo phone number ID the confirmation texts are sent from. It is the same number the trigger listens on.
   - `TABLE_ID`: the ID of the Zapier Table that holds the weight log. Create the table first, with fields for record date, contact phone, original message and weight.
   - `MIN_WEIGHT`: weights must be greater than this to be logged. Defaults to `0`.
   - `ACK_TEMPLATE`: the confirmation text. `{weight}` is replaced with the logged value.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the workflow's editor link.

## Ask the user

- Which Zapier Table is the central weight log, and which of its fields hold the record date, contact phone, original message and weight?
- Which Quo phone number do clients text? Its ID goes in the trigger's `resource_ids` and in `QUO_FROM_PHONE_NUMBER_ID`.
- Do clients always send one unit? The first number in a text is used as the weight, so a text like "182 lb" works, but a text with two numbers takes the first one.
- Should the confirmation read something other than the default?

## Test

Run this sample as a test run before publishing, with a number that belongs to a test contact:

```json
{
  "body": "Weight 182.4 lb",
  "from": "+15555550123",
  "createdAt": "2026-10-29T10:15:00Z"
}
```

Check that one new row was added to the weight log with the record date set to the sample time, the sender's number in the contact phone field, the original text in the original message field, and `182.4` in the weight field. Check that the sender got one text back reading "Thanks, logged your weight: 182.4." Then delete the test row from the table.

Then send `"Feeling good today"` as `body` and check that no row was added and no text was sent.

## Customize

- **Coach alert for out-of-range weights:** add a step after the row is created that texts or emails a coach when the weight is above or below set limits.
- **Weekly digest for program coordinators:** add a scheduled workflow that reads the weight log once a week and sends a summary of the new entries.

## Notes

- The record date is the time the client sent the text, so late-arriving messages still land on the right day.
- Units are not converted. Pounds and kilograms go into the same weight field as written.
- Texts from numbers that are not clients are logged too. Filter the trigger if only enrolled clients should be recorded.
- Quo's messaging policy applies to the confirmation texts.
