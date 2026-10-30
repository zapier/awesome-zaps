---
name: send-milestone-summaries-to-upgrade-team-by-email
description: Build a Zapier Next Gen Zap that watches a Google Calendar for customer milestone events (30, 60, 90 or 180 days) and emails a short summary to the upgrade team. Use when a customer success team tracks account milestones as calendar events and wants a concise email per milestone so upgrade or retention owners can act.
metadata:
  author: zapier
  summary: "When a customer milestone event is coming up on your calendar, your upgrade team gets a short email with the account's notes, so they can act before the milestone."
  apps: "Google Calendar, Gmail"
  category: "Customer Service & Success"
  job: "Customer success operations"
  source: "https://zapier.com/automations/customer-service-success/customer-success-operations/proactive-customer-outreach/send-milestone-summaries-to-upgrade-team-by-email"
---

# Send milestone summaries to upgrade team by email

## What it does

1. **Trigger:** a Google Calendar Event Start trigger fires 15 minutes before an event on the chosen calendar starts.
2. **Match:** the event title is checked for a package code (`ENTERPRISE`, `BUSINESS`, `PRO` or `STARTER`) and a milestone window (`30`, `60`, `90` or `180` days). If either is missing, the run stops and sends nothing.
3. **Gmail** sends one email to the upgrade address. The subject is the package, the day count and the event start time. The body has the event title, start time, the event's description (the milestone notes) and the event link.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Calendar, Event Start (`google-calendar`, `event_start`), with `authentication_id` set to the user's Google Calendar connection. Params: `calendarid` = `CALENDAR_ID`, `time_length` = `15`, `time_unit` = `"minutes"`. No search term.
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the user's Gmail connection, for the account that sends the summaries.
3. **Constants:**
   - `CALENDAR_ID`: the calendar the trigger watches. Used in the trigger params, not in the code.
   - `UPGRADE_EMAIL`: where the summaries go. It must be the Gmail account's own address, unless the user has confirmed another recipient.
   - `PACKAGE_CODES`: the package names to match in event titles. Change them to the user's own tier names.
   - `MILESTONE_DAYS`: the day counts that trigger an email.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user the trigger is live.

## Ask the user

- Which calendar holds the milestone events?
- Who should receive the summaries (the upgrade team's address)?
- What are the package or tier names in event titles? Does the title also carry the day count (for example "PRO 30-day milestone")?
- Should the 15-minute lead time change?

## Test

Run these samples as draft test runs (`run_workflow_draft` in Zapier MCP) before publishing.

Milestone sample (expects one email):

```json
{
  "summary": "[install-test] PRO 30-day milestone: Acme onboarding",
  "description": "[install-test] Acme reached 30 days live. 12 seats active, asked about SSO.",
  "start": { "dateTime": "2026-10-30T10:00:00-04:00" },
  "htmlLink": "https://calendar.google.com/calendar/event?eid=install-test-sample",
  "id": "install-test-sample"
}
```

Non-matching sample (expects a skip and no email):

```json
{
  "summary": "[install-test] Quarterly check-in",
  "description": "[install-test] No package code or milestone in title; should be skipped.",
  "start": { "dateTime": "2026-10-30T14:00:00-04:00" },
  "htmlLink": "https://calendar.google.com/calendar/event?eid=install-test-skip",
  "id": "install-test-skip"
}
```

Confirm that the milestone run completed, that one email reached the upgrade address with the subject `PRO 30-day milestone (…)` and the event text in the body, and that the non-matching run returned `skipped: true` with no send. Then tell the user to delete any test events and emails they don't want.

## Customize

- **Log outreach:** add a CRM or tracker row after the Gmail step to record the outreach and owner.
- **Team chat instead of email:** replace the email with a message to a team channel.

## Notes

- Events are matched by title, so titles must follow the package and day-count pattern. An event whose title doesn't match is skipped silently.
- The spec's "days since start" can't be computed from a trigger that fires before the event starts. The day count is read from the title instead.
- One email goes out per qualifying event; there is no batching.
- Never commit a real calendar ID or email address. Anyone who can read the workflow can see who gets the summaries.
