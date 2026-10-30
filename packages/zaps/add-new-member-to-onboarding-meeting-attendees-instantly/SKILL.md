---
name: add-new-member-to-onboarding-meeting-attendees-instantly
description: Build a Zapier Next Gen Zap that adds a new member as an attendee on a configured Outlook onboarding meeting when their details arrive by webhook, so they receive the calendar invite. Use when a team onboards people into a fixed Outlook meeting and wants new members added without anyone editing the invite by hand.
metadata:
  author: zapier
  summary: "When a new member's details arrive, they're added to your onboarding meeting in Outlook, so they get the invite without anyone adding them by hand."
  apps: "Webhooks by Zapier, Microsoft Outlook"
  category: "Business Owners"
  job: "Scheduling coordination"
  source: "https://zapier.com/automations/business-owners/scheduling-coordination/appointment-scheduling/add-new-member-to-onboarding-meeting-attendees-instantly"
---

# Add new member to onboarding meeting attendees instantly

## What it does

1. **Trigger:** a new member payload arrives at a Webhooks by Zapier catch hook. The workflow reads `email` and `name` from it. Without an email it stops.
2. **Microsoft Outlook** searches the calendar window for the onboarding meeting, matching the event title exactly. If none matches, the run stops and changes nothing.
3. **Microsoft Outlook** adds the member's email as an attendee of that event, merging with existing attendees. If the address is already on the event, nothing is added.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `microsoft-outlook`: the user's Microsoft Outlook connection, for the account whose calendar holds the onboarding meeting. The account must be able to edit that event.
3. **Constants:**
   - `ONBOARDING_EVENT_TITLE`: the meeting's title, exactly as shown in Outlook.
   - `ONBOARDING_WINDOW_START` and `ONBOARDING_WINDOW_END`: the time window to search, as ISO 8601 with an offset. Widen it to cover the meeting's date.
   - `CALENDAR_ID`: the calendar to search. Leave it empty for the default calendar.

## Ask the user

- What is the exact title of the onboarding meeting, and on which date or window does it fall?
- Which Outlook calendar holds it? Leave blank for the default.
- What keys does the intake webhook send for the member's email and name? The workflow reads `email` and `name`; if the sender uses other keys, change them before installing.

## Test

Once an Outlook connection exists, run this sample as a draft test run (`run_workflow_draft`) before publishing. Use the connected Outlook account's own address as `email`, so the invite goes only to that account:

```json
{
  "email": "YOUR_OUTLOOK_ADDRESS",
  "name": "Test Member"
}
```

Set the constants to a test meeting named `[install-test] …` on your own calendar, created for this run. Check that the output has `added: true` and `eventId`, that the event's attendees now include the address, and that a second run with the same address returns `already-attendee` without adding it again.

## Customize

- **Send a confirmation email** to the new member after they are added: a send-email step after the add step.
- **Create a follow-up task** when no matching meeting is found: a task step after the search step, in place of the `event-not-found` return.

## Notes

- The Outlook search matches substrings, so the workflow keeps only events whose subject equals the title exactly.
- Outlook's invite takes only the address, so the member's name is returned in the run output but is not set on the attendee.
- The output shapes of the Outlook search and add actions were not read from a live run; the first test run confirms them.
