---
name: send-personalized-itinerary-emails-one-day-before-trips
description: Build a Zap on Zapier that emails a traveler a personalized itinerary link from a new Google Calendar travel event, one day before the trip (or straight away for short-notice trips). Use when a travel-hosting or concierge business keeps trip details in a calendar and wants each traveler's itinerary emailed without manual sends.
license: MIT
metadata:
  author: zapier
  summary: "When a trip is added to your travel calendar, the traveler gets a personalized itinerary email with their link, one day before they leave."
  apps: "Google Calendar, Gmail"
  category: "Personal Productivity"
  job: "Travel hosting"
  source: "https://zapier.com/automations/personal-productivity/travel-hosting/itinerary-management/send-personalized-itinerary-emails-one-day-before-trips"
---

# Send personalized itinerary emails one day before trips

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-personalized-itinerary-emails-one-day-before-trips. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new event is created on your travel calendar in Google Calendar (`google-calendar`, `new_event`).
2. **Plain code** reads the traveler's email address from the event description, and the itinerary token from the event's location URL. If either is missing, the run stops and nothing is sent.
3. **Plain code** works out when to send. Trips starting within one day are skipped. Trips with less than 11 days' notice are emailed right away. Other trips wait until one day before the trip starts.
4. **Gmail** sends the traveler an HTML email with a personalized subject and a link to their itinerary, built from the token.

The Zap sends at most one email per event and never changes the calendar.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                      | Where                                                             | What goes there                                                                                                   |
| ---------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `REPLACE_CALENDAR_ID`        | `config.ts`, `CALENDAR_ID`; `triggers/new-event.ts`, `calendarid` | The Google Calendar that holds the travel events. Use the same calendar in both.                                  |
| `REPLACE_ITINERARY_BASE_URL` | `config.ts`, `ITINERARY_BASE_URL`                                 | The base URL of the itinerary site, ending in a slash. The token from the event's location URL is appended to it. |

Review these defaults with the user:

- `SENDER_ADDRESS` in `config.ts`: a sender alias on the connected Gmail account. Leave it empty to send from the account's default address.
- `SHORT_NOTICE_DAYS` (11) and `SEND_LEAD_DAYS` (1) in `workflow.ts`: is 11 days the right short-notice cutoff, and is one day before the trip the right send time?

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` (the account the emails are sent from) and `google-calendar` (the account that reads the travel calendar; the trigger uses it too) to the user's connections. No other app needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-event.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's `calendarid` to the same calendar as `CALENDAR_ID`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test (`run_workflow_draft` in Zapier MCP) with a test event on a calendar the user owns and a traveler address the user controls:

```json
{
  "summary": "Lisbon trip - Dana Reyes",
  "description": "Traveler: dana@example.com",
  "location": "https://itineraries.example.com/t/abc123",
  "start": "2026-12-01T09:00:00-05:00"
}
```

Check that `sent` is true, `recipient` is the address in the description, and `link` ends with the token from the location URL. Check that the email arrived at the test address with the personalized subject and a working itinerary link. For a trip under 11 days away, check that it was sent right away (`shortNotice` is true). If run-status tools aren't available, check the result in Gmail directly. Publish only after the test passes, and confirm the trigger is active. The user deletes the test event and the test email, not the agent.

## Notes

- Google Calendar and Gmail both need the user's own connections. The traveler's email address and the itinerary token come from the calendar event, so keep the event description and location consistent with how the itinerary site expects them.
- A trip that starts within one day is skipped on purpose, because the one-day-before email would already be late.
- Don't share a copy of the Zap that still has your real calendar ID, sender address or itinerary site URL in it.
- To log each delivery, add a Google Sheets row after the email is sent. For urgent same-day trips, add an SMS step.
