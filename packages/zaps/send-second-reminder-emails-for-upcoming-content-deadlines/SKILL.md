---
name: send-second-reminder-emails-for-upcoming-content-deadlines
description: Build a Zapier Next Gen Zap that emails a contributor a second reminder one week before their scheduled content event, using the contributor's address and name from the event. Use when an editorial or content team tracks submissions as Google Calendar events and wants a follow-up email to go out automatically before each publication date.
metadata:
  author: zapier
  summary: "One week before a scheduled content event, the contributor named in it gets a second reminder email with the date, unless they have already submitted."
  apps: "Google Calendar, Gmail"
  category: "Personal Productivity"
  job: "Email management"
  source: "https://zapier.com/automations/personal-productivity/email-management/email-follow-up-reminders/send-second-reminder-emails-for-upcoming-content-deadlines"
---

# Send second reminder emails for upcoming content deadlines

## What it does

1. **Trigger:** a Google Calendar event is one week away (Event Start, weeks = 1) on the calendar you choose.
2. **Filter:** the run stops without sending if the event description contains the submission marker, if no email address can be found in the description or title, or if the contributor's address is on your company domain.
3. **Message:** the contributor's email address is taken from the description (or the title if the description has none), and their name from the part of the title after a dash. The email gives the event title and date, and adds the location when the event has one.
4. **Gmail** sends the message from your connected account, with a blind copy to your internal address.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Calendar, Event Start (`google-calendar`, `event_start`). Set **Calendar** to the calendar whose events hold the content deadlines, **Time Before (Unit)** to `weeks` and **Time Before** to `1`. Leave Search Term empty.
2. **Connections** (each alias in the code is the app's slug):
   - `google-calendar`: the Google Calendar connection for the calendar above.
   - `gmail`: the Gmail connection that sends the reminders. Its primary address is the sender.
3. **Constants:**
   - `INTERNAL_DOMAIN`: your company's email domain, without the `@`. Contributors on it are skipped.
   - `SUBMISSION_MARKER`: the text that means a submission has already arrived, such as `submission received`. Matched in any letter case.
   - `BCC_RECIPIENTS`: the addresses that get a blind copy of every reminder.
   - `TIMEZONE`: the time zone for the date in the email, as an IANA name such as `America/New_York`.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user the workflow is live.

## Ask the user

- Which calendar holds the content deadlines?
- Which Gmail account sends the reminders, and which addresses should get the blind copy?
- What is your company's email domain, so internal contributors can be skipped?
- What text in the event description marks a submission as received?
- Which time zone should the date in the email use?

## Test

Use a sample event like this one, with a contributor address you control in place of the example:

```json
{
  "id": "evt_0001",
  "summary": "Essay - Jane Doe",
  "description": "Draft due for the November issue. Contact: jane@example.com",
  "location": "Remote",
  "start__dateTime": "2026-11-06T09:00:00-05:00"
}
```

Confirm that:

- One email goes to `jane@example.com`, with the subject naming the event and the date.
- The greeting reads `Hi Jane Doe`, and the body mentions the location because the sample has one.
- The blind copy reaches the address in `BCC_RECIPIENTS`.
- Adding the submission marker to the description makes the run skip with `submission-already-received`, and nothing is sent.
- Removing every email address makes the run skip with `no-contributor-email`, and nothing is sent.

## Customize

- **Alternate message when the event has a series or location:** send a different subject and body when the event has a location value, instead of adding it to the same message.
- **Internal task for missing submissions:** instead of emailing a reminder, create a task for the editor when the contributor cannot be found.

## Notes

- Contributors are matched by the email address in the event, not by name.
- Only the first email address found in the description is used. If the description has none, the title is searched.
- The trigger fires one week before each event starts.
- Anyone who can reach the event can see the contributor's address in it. Keep sensitive contact details out of event descriptions.
