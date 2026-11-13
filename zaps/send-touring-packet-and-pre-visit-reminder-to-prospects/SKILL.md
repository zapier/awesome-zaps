---
name: send-touring-packet-and-pre-visit-reminder-to-prospects
description: Build a Zap on Zapier that emails a prospect the touring packet link before a booked visit, using the prospect's name and email from the Google Calendar event description. Use when a hospitality or property business books tours on Google Calendar and wants every prospect to get the packet ahead of the visit without anyone sending it by hand.
license: MIT
metadata:
  author: zapier
  summary: "Before a booked tour, the prospect gets an email with your touring packet link, so they arrive prepared and nobody has to send it by hand."
  apps: "Google Calendar, Gmail"
  category: "Business Owners"
  job: "Hospitality operations"
  source: "https://zapier.com/automations/business-owners/hospitality-operations/booking-confirmation-workflows/send-touring-packet-and-pre-visit-reminder-to-prospects"
---

# Send touring packet and pre-visit reminder to prospects

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-touring-packet-and-pre-visit-reminder-to-prospects. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Google Calendar "Event Start" fires a set time before a calendar event starts (one day before, in this zap), for events whose title or description matches a search term (`google-calendar`, `event_start`).
2. The workflow reads the event description for `Prospect:` and `Email:` lines. If there is no valid email, the run stops and sends nothing.
3. **Gmail** sends the prospect an email with the touring packet link and the appointment start time, signed with your name.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting              | What goes there                                                                         |
| -------------------- | --------------------------------------------------------------------------------------- |
| `TOURING_PACKET_URL` | The link to the touring packet (a PDF, deck or web page) the prospect receives by email |
| `AGENT_NAME`         | The name the packet email is signed with                                                |

Also confirm before building:

- Which calendar holds the tour bookings, and which search term do the tour events share?
- Which Gmail account should send the packet?
- How far ahead of the visit should the email go? The template uses one day.
- Do the calendar event descriptions include `Prospect:` and `Email:` lines? If the bookings use another format, tell the user before installing: the code only reads those two labels.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` (the Gmail account that sends the packet) and `google-calendar` (the calendar with the tour bookings) to the user's connections.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/event-start.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a test event on the user's own calendar, named `[install-test] …`, with the prospect email set to the connected Gmail address:

```json
{
  "id": "sample-event-id",
  "summary": "[install-test] Touring visit for prospect",
  "description": "Prospect: [install-test] Test Prospect\nEmail: you@example.com\nPhone: (555) 555-0100\nAppointment: 30-minute walkthrough",
  "start": {
    "dateTime": "2026-10-29T22:30:00-04:00",
    "timeZone": "America/New_York"
  },
  "htmlLink": "https://www.google.com/calendar/event?eid=<event-eid>",
  "attendee_emails": ""
}
```

Check that the run completes, the output shows `sent: true` with the connected address as `to`, and the email arrives there with the packet link and the appointment time. If run-status tools aren't available, check the result in Gmail directly. Then publish, confirm the trigger is active, and tell the user what to check on their calendar events. The user deletes the test event and test email, not the agent, if they don't want them.

## Notes

- Gmail sends only to the address in the event description, so a test event that names the connected address reaches only that address.
- The SMS reminder is not built. SMS by Zapier texts only the connection's own verified number, not the prospect, so a text provider the business owns (for example, a Twilio account) would be needed.
- To text the prospect a reminder, log outreach in a CRM, or send the packet as an attachment, add a step after the email: a text provider, a CRM action, or the packet file in the Gmail action's `file` input.
- For several teams, use a table or sheet and look up the team's packet link and signer per event, instead of the two constants.
- The trigger fires on every matching event on the calendar, not just prospect visits. Keep the search term specific.
- Never commit a real calendar ID or packet link to a public copy of this file.
