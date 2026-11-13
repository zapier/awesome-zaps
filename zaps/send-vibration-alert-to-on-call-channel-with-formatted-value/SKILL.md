---
name: send-vibration-alert-to-on-call-channel-with-formatted-value
description: Build a Zap on Zapier that receives vibration readings from a device by webhook, formats the value, and posts an alert to an on-call Telegram chat when the reading is above a threshold. Use when an IoT or industrial device sends vibration telemetry and technicians need a fast, readable alert in their on-call chat.
license: MIT
metadata:
  author: zapier
  summary: "When a device reports a vibration reading above your limit, the on-call chat gets a formatted alert with the device, the reading and the time, so technicians can triage quickly."
  apps: "Webhooks by Zapier, Telegram"
  category: "IT"
  job: "Io t connected operations"
  source: "https://zapier.com/automations/it/io-t-connected-operations/device-alert-management/send-vibration-alert-to-on-call-channel-with-formatted-value"
---

# Send vibration alert to on-call channel with formatted value

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-vibration-alert-to-on-call-channel-with-formatted-value. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a device or script posts a telemetry reading to a Webhooks by Zapier catch hook (`webhook`, `hook_v2`).
2. **Check:** if there is no numeric vibration reading, the run stops. If the reading is at or below the threshold, the run stops and sends nothing.
3. **Format:** the reading is rounded to one decimal place.
4. **Telegram** sends one alert to the on-call chat with the device ID, the formatted value, the raw reading, the threshold and the timestamp.

Readings at or below the threshold never send a message.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                   | Where       | What goes there                                                                                                     |
| ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_ON_CALL_CHAT_ID` | `config.ts` | The Telegram chat or group that is on call. The bot must already be a member.                                       |
| `REPLACE_ON_CALL_MENTION` | `config.ts` | The on-call person's Telegram username, including the @. Only used when `MENTION_ON_CALL` is true (off by default). |

Also review these defaults with them, in the constants at the top of `workflow.ts`:

- `VIBRATION_THRESHOLD` (default `100`): the reading above which an alert is sent.
- `VALUE_PRECISION` (default `1`): decimal places for the formatted value.
- `MENTION_ON_CALL` (default `false`): whether each alert starts with a mention.
- The sender's field names. The workflow reads `device_id`, `vibration` and `timestamp`. If the sender uses other names, change the schema in `workflow.ts` before installing.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `telegram` to the user's Telegram bot connection, with the bot added to the on-call chat. The webhook trigger needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections, and sample the trigger, before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with a chat the user controls, using this sample input:

```json
{
  "device_id": "PUMP-07",
  "vibration": 142.36,
  "timestamp": "2026-10-29T10:15:00Z"
}
```

Check that one Telegram message arrives in the chat and reads `Vibration alert: PUMP-07 read 142.4 (raw 142.36, threshold 100) at 2026-10-29T10:15:00Z.`

Then run a sample at or below the threshold, such as `"vibration": 88.1`. Check that no Telegram message is sent and the run ends as skipped with `below-threshold`.

If run-status tools aren't available, check the result in Telegram directly. Ask the user to delete the test messages; the agent doesn't delete test data. Then publish, confirm the trigger is active, and send a real reading above the threshold to check the live alert.

## Notes

- Above means strictly above: a reading exactly equal to the threshold does not alert.
- Each qualifying reading sends its own message, so a device that reports many high readings fills the chat. The device ID is in each alert; nothing is looked up against earlier events.
- To open an incident ticket when alerts repeat for one device, add a project management step. To reach someone when Telegram is missed on high readings, add an SMS or voice step.
- Never put a real chat ID, bot token or webhook URL in the code or docs. Anyone with the webhook URL can trigger alerts.
