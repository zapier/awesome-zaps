---
name: send-touring-packet-and-pre-visit-reminder-to-prospects
description: Build a Zapier Next Gen Zap that emails a prospect the touring packet link before a booked visit, using the prospect's name and email from the Google Calendar event description. Use when a hospitality or property business books tours on Google Calendar and wants every prospect to get the packet ahead of the visit without anyone sending it by hand.
metadata:
  author: zapier
  summary: "Before a booked tour, the prospect gets an email with your touring packet link, so they arrive prepared and nobody has to send it by hand."
  apps: "Google Calendar, Gmail"
  category: "Business Owners"
  job: "Hospitality operations"
  source: "https://zapier.com/automations/business-owners/hospitality-operations/booking-confirmation-workflows/send-touring-packet-and-pre-visit-reminder-to-prospects"
---

# Send touring packet and pre-visit reminder to prospects

## What it does

1. **Trigger:** a Google Calendar "Event Start" fires a set time before a calendar event starts (one day before, in this zap), for events whose title or description matches a search term.
2. The workflow reads the event description for `Prospect:` and `Email:` lines. If there is no valid email, the run stops and sends nothing.
3. **Gmail** sends the prospect an email with the touring packet link and the appointment start time, signed with your name.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Calendar, Event Start (`google-calendar`, `event_start`), with the calendar's own connection as its `authentication_id`. Params:
   - `calendarid`: the calendar with your tours on it. This zap used `you@example.com`.
   - `time_length` / `time_unit`: `1` / `days`. The email goes out a day before the visit.
   - `search_term`: a word every tour event shares. This zap used `install-test`, which matches nothing real. Change it to your own tour keyword before going live.
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the Gmail account that sends the packet.
3. **Constants:**
   - `TOURING_PACKET_URL`: the link to your touring packet (PDF, deck or web page).
   - `AGENT_NAME`: the name the email is signed with.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user what to check on their calendar events.

## Ask the user

- Which calendar holds the tour bookings? Which search term do the tour events share?
- Which Gmail account should send the packet?
- Where is the touring packet, and what name should sign the email?
- How far ahead of the visit should the email go? The template uses one day.
- Do the calendar event descriptions include `Prospect:` and `Email:` lines? If the bookings use another format, tell the user before installing: the code only reads those two labels.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. It is the record shape Google Calendar's Event Start trigger returns, for a test event on the user's own calendar, named `[install-test] …`, with the prospect email set to the connected Gmail address:

```json
{
  "id": "dspv9fb3hp6gsjdphi5ip58qko",
  "summary": "[install-test] Touring visit for prospect",
  "description": "Prospect: [install-test] Test Prospect\nEmail: you@example.com\nPhone: (555) 555-0100\nAppointment: 30-minute walkthrough",
  "start": {
    "dateTime": "2026-10-29T22:30:00-04:00",
    "timeZone": "America/New_York"
  },
  "htmlLink": "https://www.google.com/calendar/event?eid=ZHNwdjlmYjNocDZnc2pkcGhpNWlwNThxa28gYW5kcmV3LmtvcmRhbXBhbG9zQHphcGllci5jb20",
  "attendee_emails": ""
}
```

Check that the run completes, the output shows `sent: true` with the connected address as `to`, and the email arrives there with the packet link and the appointment time. Then tell the user to delete the test event and the test email if they are not wanted.

## Customize

- **Text the prospect a reminder:** add a step that sends an SMS to the prospect's phone once a text provider is connected (see Notes).
- **Log outreach in the CRM:** after the email step, add a CRM action (find or create the lead, then log the email). It needs a CRM connection.
- **Packet as attachment:** add the packet file to the Gmail action's `file` input instead of linking to it.
- **Different timing or templates per team:** change the trigger's time, or read a team name from the event and pick its packet link.

## Notes

- Gmail sends only to the address found in the event description, so a test event that names the connected address reaches only that address.
- The SMS reminder is not built. SMS by Zapier texts only the connection's own verified number, not the prospect, so it cannot reach a prospect as the spec describes. A SMS provider connection (for example, a Twilio account the business owns) would be needed.
- The spec's Zapier Tables team lookup is replaced by the `TOURING_PACKET_URL` and `AGENT_NAME` constants. For several teams, use a table or sheet and look up the team per event.
- The trigger fires on every matching event on the calendar, not just prospect visits. Keep the search term specific.
- Never commit a real calendar ID or packet link to a public copy of this file.
