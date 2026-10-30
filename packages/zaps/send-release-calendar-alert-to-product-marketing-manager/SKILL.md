---
name: send-release-calendar-alert-to-product-marketing-manager
description: Build a Zapier Next Gen Zap that sends the event owner a Slack direct message with the time and link when a release event is added to a Google Calendar. Use when a product team plans launches on a shared calendar and wants the product marketing owner alerted quickly enough to start launch comms.
metadata:
  author: zapier
  summary: "When a release goes on the calendar, the owner gets a Slack message with the title, time and link so launch comms can start right away."
  apps: "Google Calendar, Slack"
  category: "Product"
  job: "Product launch management"
  source: "https://zapier.com/automations/product/product-launch-management/launch-coordination/send-release-calendar-alert-to-product-marketing-manager"
---

# Send release calendar alert to product marketing manager

## What it does

1. **Trigger:** a new event is created on the release calendar (Google Calendar, New Event).
2. The workflow stops without doing anything unless the event title contains a release keyword (`release` or `launch` by default).
3. **Slack** looks up the Slack user whose email matches the event organizer. If there is no match, the team fallback recipient is used.
4. The workflow formats the event's date and time, then **Slack** sends that person a direct message with the event title, the time, the event description (tags removed) and the calendar link.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Calendar, New Event (`google-calendar`, `new_event`). Set the trigger's **Calendar** parameter to the release calendar's ID (in the Google Calendar calendar list, the calendar's ID is its address, such as `YOUR_CALENDAR_ID`). Pick the Google Calendar connection for the account that can read that calendar. It is set in the trigger configuration, not in the code.
2. **Connections** (each alias in the code is the app's slug):
   - `slack`: the user's Slack connection for their own workspace. It must be able to look up users by email and send direct messages.
   - The Google Calendar trigger connection, from step 1.
3. **Constants** (at the top of `workflow.ts`):
   - `RELEASE_KEYWORDS`: words that mark an event as a release. Defaults to `["release", "launch"]`.
   - `FALLBACK_SLACK_USER_ID`: the Slack user ID that receives the message when no one matches the organizer's email. Use the team's launch owner, not a channel.
   - `SEND_MENTIONS`: keep `false` so the message never notifies anyone. Set `true` only if the user wants `@mentions` in the text to ping people.

## Ask the user

- Which Google Calendar is the release calendar?
- Which words in an event title mark it as a release? Keep the defaults if they don't say.
- Who should get the alert when the organizer has no Slack account with the same email? Their Slack user ID goes in `FALLBACK_SLACK_USER_ID`.

## Test

Run this sample as a test run before publishing, with a release event that exists on the user's own calendar:

```json
{
  "summary": "Release: Widgets 2.0 (beta)",
  "description": "Beta launch of Widgets 2.0 to design partners.",
  "htmlLink": "https://www.google.com/calendar/event?eid=EXAMPLE",
  "organizer": { "email": "owner@example.com" },
  "start": {
    "dateTime": "2026-11-03T10:00:00-05:00",
    "timeZone": "America/New_York"
  },
  "end": {
    "dateTime": "2026-11-03T10:30:00-05:00",
    "timeZone": "America/New_York"
  }
}
```

Check that:

- The run continues past the filter, because the title contains "Release".
- The Slack lookup finds the user whose email is `owner@example.com`, or falls back to the fallback recipient if none exists.
- The direct message arrives in that Slack user's DMs with the title, a readable time (for example `Mon, Nov 3, 2026, 10:00 AM – 10:30 AM EST`), the description and the link, and it does not notify anyone.
- A non-release title such as "Team lunch" stops the run without sending anything.

## Customize

- **Send to a team channel** instead of a DM for cross-functional launches: change the Slack action to a channel message.
- **Create a follow-up task** in the team's project tool instead of a Slack message, so the owner gets an assignment.

## Notes

- Matching on the organizer's email only works when the organizer has the same email in Slack.
- Google Calendar events without a start time are sent with "Time not set" as the time.
- Keep `SEND_MENTIONS` off unless the user wants the alert to ping people.
- Never commit a real Slack user ID or calendar ID into a shared copy of this file.
