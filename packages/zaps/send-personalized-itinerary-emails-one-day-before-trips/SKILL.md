---
name: send-personalized-itinerary-emails-one-day-before-trips
description: Build a Zapier Next Gen Zap that emails a traveler a personalized itinerary link from a new Google Calendar travel event, one day before the trip (or straight away for short-notice trips). Use when a travel-hosting or concierge business keeps trip details in a calendar and wants each traveler's itinerary emailed without manual sends.
metadata:
  author: zapier
  summary: "When a trip is added to your travel calendar, the traveler gets a personalized itinerary email with their link, one day before they leave."
  apps: "Google Calendar, Gmail"
  category: "Personal Productivity"
  job: "Travel hosting"
  source: "https://zapier.com/automations/personal-productivity/travel-hosting/itinerary-management/send-personalized-itinerary-emails-one-day-before-trips"
---

# Send personalized itinerary emails one day before trips

## What it does

1. **Trigger:** a new event is created on your travel calendar in Google Calendar.
2. **Plain code** reads the traveler's email address from the event description, and the itinerary token from the event's location URL. If either is missing, the run stops and nothing is sent.
3. **Plain code** works out when to send. Trips starting within one day are skipped. Trips with less than 11 days' notice are emailed right away. Other trips wait until one day before the trip starts.
4. **Gmail** sends the traveler an HTML email with a personalized subject and a link to their itinerary, built from the token.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**Check the fields first:** with the user's own connections, inspect the trigger and the Gmail send action (`get_trigger_fields`, `inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Calendar, New Event (`google-calendar`, action `new_event`). Set `calendarid` to the travel calendar. It needs the user's Google Calendar connection.
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the user's Gmail connection, for the account the emails are sent from.
3. **Constants:**
   - `CALENDAR_ID`: the travel calendar's ID. Use the same value as the trigger's `calendarid`.
   - `ITINERARY_BASE_URL`: the base URL of your itinerary site. The token from the event's location URL is appended to it.
   - `SENDER_ADDRESS`: a sender alias on the connected Gmail account. Leave it empty to send from the account's default address.
   - `SHORT_NOTICE_DAYS`: trips with less notice than this many days are emailed right away. Defaults to `11`.
   - `SEND_LEAD_DAYS`: how many days before the trip the email goes out. Defaults to `1`.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the workflow's editor link.

## Ask the user

- Which Google calendar holds the travel events?
- What is the base URL of the itinerary site, and does the event's location URL carry the traveler's token as its last path segment?
- Which sender address should the emails come from? It must be an alias on the connected Gmail account.
- Is 11 days the right short-notice cutoff, and is one day before the trip the right send time?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a test event on a calendar the user owns, and a traveler address the user controls:

```json
{
  "summary": "Lisbon trip - Dana Reyes",
  "description": "Traveler: dana@example.com",
  "location": "https://itineraries.example.com/t/abc123",
  "start": "2026-12-01T09:00:00-05:00"
}
```

Check the draft run output: `sent` is true, `recipient` is the address in the description, and `link` ends with the token from the location URL. Check that the email arrived at the test address with the personalized subject and a working itinerary link. For a trip under 11 days away, confirm it was sent right away (`shortNotice` is true). Then delete the test event.

## Customize

- **Log each delivery** to a Google Sheets row after the email is sent, for reporting.
- **Urgent same-day trips** get an extra SMS step.

## Notes

- Google Calendar and Gmail both need the user's own connections. The traveler's email address and the itinerary token come from the calendar event, so keep the event description and location consistent with how the itinerary site expects them.
- A trip that starts within one day is skipped on purpose, because the one-day-before email would already be late.
- Never commit a real calendar ID, sender address or itinerary site URL. Anyone reading them can see where your travel data lives.
