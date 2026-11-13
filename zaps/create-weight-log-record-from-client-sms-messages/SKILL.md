---
name: create-weight-log-record-from-client-sms-messages
description: Build a Zap on Zapier that logs each weight a client texts to your business phone number as a new row in a Zapier Table, timestamped with the sender's number and the original message, then texts the client back a confirmation with the logged weight. Use when a coach, clinic or wellness program collects weigh-ins by SMS and wants them in one central table without manual entry.
license: MIT
metadata:
  author: zapier
  summary: "When a client texts in their weight, it's logged as a timestamped row in your central table and they get a short text back confirming it."
  apps: "Quo, Zapier Tables"
  category: "Personal Productivity"
  job: "Health wellness tracking"
  source: "https://zapier.com/automations/personal-productivity/health-wellness-tracking/fitness-tracking-automation/create-weight-log-record-from-client-sms-messages"
---

# Create weight log record from client SMS messages

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-weight-log-record-from-client-sms-messages. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new message arrives on your Quo phone number (`quo`, `new_incoming_message`). Quo is formerly OpenPhone. The message text, the sender's number and the time it was sent are passed along.
2. **Weight:** the text is scanned for a number. Commas are removed, and the first number found is taken as the weight. If there is no number above zero, the run stops and nothing is written or sent.
3. **Zapier Tables** adds one new row to your weight log: the record date, the sender's phone number, the original message, and the weight.
4. **Quo** texts the sender back a short confirmation with the logged weight, from your Quo number.

Every qualifying message gets its own new row. Existing rows are never changed.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                            | What goes there                                                                                                                     |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_QUO_FROM_PHONE_NUMBER_ID` | The Quo phone number clients text. Its ID is the confirmation's "From" line, and the trigger's `resource_ids` uses the same number. |
| `REPLACE_TABLE_ID`                 | The Zapier Table that holds the weight log. It needs fields for record date, contact phone, original message and weight.            |

Ask which of the table's fields hold each of those four things, and create the table first if it doesn't have them.

Also review the defaults with them: `ACK_TEMPLATE` in `config.ts` (the confirmation text; `{weight}` is replaced with the logged value) and `MIN_WEIGHT` in `workflow.ts` (weights must be greater than this to be logged; `0`).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `quo` to the user's Quo connection, for the number that receives and sends the texts, and `zapier-tables` to the user's Zapier Tables connection, for the account that owns the weight log table. Every app here needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-incoming-message.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a number that belongs to a test contact:

```json
{
  "body": "Weight 182.4 lb",
  "from": "+15555550123",
  "createdAt": "2026-10-29T10:15:00Z"
}
```

Check that one new row was added to the weight log with the record date set to the sample time, the sender's number in the contact phone field, the original text in the original message field, and `182.4` in the weight field. Check that the sender got one text back reading "Thanks, logged your weight: 182.4."

Then send `"Feeling good today"` as `body` and check that no row was added and no text was sent.

If run-status tools aren't available, check the result in Zapier Tables directly. The user deletes the test data, not the agent. Then publish, confirm the trigger is active, and give the user the workflow's editor link.

## Notes

- The record date is the time the client sent the text, so late-arriving messages still land on the right day.
- Units are not converted. Pounds and kilograms go into the same weight field as written, and only the first number in a text is used.
- Texts from numbers that are not clients are logged too. Filter the trigger if only enrolled clients should be recorded.
- Quo's messaging policy applies to the confirmation texts.
- To extend it: text or email a coach when a weight is outside set limits, or add a scheduled workflow that sends program coordinators a weekly digest of new entries.
