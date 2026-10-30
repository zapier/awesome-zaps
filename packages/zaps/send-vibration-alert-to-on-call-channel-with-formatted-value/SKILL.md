---
name: send-vibration-alert-to-on-call-channel-with-formatted-value
description: Build a Zapier Next Gen Zap that receives vibration readings from a device by webhook, formats the value, and posts an alert to an on-call Telegram chat when the reading is above a threshold. Use when an IoT or industrial device sends vibration telemetry and technicians need a fast, readable alert in their on-call chat.
metadata:
  author: zapier
  summary: "When a device reports a vibration reading above your limit, the on-call chat gets a formatted alert with the device, the reading and the time, so technicians can triage quickly."
  apps: "Webhooks by Zapier, Telegram"
  category: "IT"
  job: "Io t connected operations"
  source: "https://zapier.com/automations/it/io-t-connected-operations/device-alert-management/send-vibration-alert-to-on-call-channel-with-formatted-value"
---

# Send vibration alert to on-call channel with formatted value

## What it does

1. **Trigger:** a device or script posts a telemetry reading to a Webhooks by Zapier catch hook.
2. **Check:** if there is no numeric vibration reading, the run stops. If the reading is at or below the threshold, the run stops and sends nothing.
3. **Format:** the reading is rounded to one decimal place.
4. **Alert:** one Telegram message goes to the on-call chat with the device ID, the formatted value, the raw reading, the threshold and the timestamp.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `telegram`: a Telegram bot connection, with the bot added to the on-call chat.
3. **Constants:**
   - `ON_CALL_CHAT_ID`: the Telegram chat ID of the on-call chat or group, or a channel username starting with `@`.
   - `VIBRATION_THRESHOLD`: the reading above which an alert is sent. Defaults to `100`.
   - `VALUE_PRECISION`: decimal places for the formatted value. Defaults to `1`.
   - `MENTION_ON_CALL` and `ON_CALL_MENTION`: set `MENTION_ON_CALL` to `true` and enter a Telegram username to prefix each alert with a mention. Defaults to off.

## Ask the user

- Which Telegram chat or group is on call, and what is its chat ID? The bot must already be a member of it.
- What threshold should trigger an alert? The default is 100.
- What does the sender call its fields? The workflow reads `device_id`, `vibration` and `timestamp`. If the sender uses other names, change the schema in `workflow.ts` before installing.
- Should each alert mention a specific on-call person? If so, set `MENTION_ON_CALL` to `true` and enter their Telegram username.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, with a chat ID that is safe for test messages:

```json
{
  "device_id": "PUMP-07",
  "vibration": 142.36,
  "timestamp": "2026-10-29T10:15:00Z"
}
```

Check that one Telegram message arrives in the chat and reads `Vibration alert: PUMP-07 read 142.4 (raw 142.36, threshold 100) at 2026-10-29T10:15:00Z.`

Then run a sample at or below the threshold, such as `"vibration": 88.1`. Check that no Telegram message is sent and the run ends as skipped with `below-threshold`.

## Customize

- **Incident ticket:** add a project management step that creates an incident ticket when alerts repeat for the same device.
- **Fallback for high severity:** add an SMS or voice step for readings well above the threshold, so the alert still reaches someone if Telegram is missed.

## Notes

- The spec's threshold comparison is "above", so a reading exactly equal to the threshold does not alert.
- The spec's "match events by device identifier if present" is handled by including the device ID in the alert. There is no lookup against prior events.
- Alerts are sent for each qualifying reading. If one device reports many readings above the threshold, the chat gets many messages.
- Never commit a real chat ID, bot token or webhook URL. Anyone with the webhook URL can trigger alerts.
