---
name: send-milestone-summaries-to-upgrade-team-by-email
description: Build a Zap on Zapier that watches a Google Calendar for customer milestone events (30, 60, 90 or 180 days) and emails a short summary to the upgrade team. Use when a customer success team tracks account milestones as calendar events and wants a concise email per milestone so upgrade or retention owners can act.
license: MIT
metadata:
  author: zapier
  summary: "When a customer milestone event is coming up on your calendar, your upgrade team gets a short email with the account's notes, so they can act before the milestone."
  apps: "Google Calendar, Gmail"
  category: "Customer Service & Success"
  job: "Customer success operations"
  source: "https://zapier.com/automations/customer-service-success/customer-success-operations/proactive-customer-outreach/send-milestone-summaries-to-upgrade-team-by-email"
---

# Send milestone summaries to upgrade team by email

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-milestone-summaries-to-upgrade-team-by-email. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Google Calendar Event Start trigger (`google-calendar`, `event_start`) fires 15 minutes before an event on the chosen calendar starts.
2. **Match:** the event title is checked for a package code (`ENTERPRISE`, `BUSINESS`, `PRO` or `STARTER`) and a milestone window (`30`, `60`, `90` or `180` days). If either is missing, the run stops and sends nothing.
3. **Gmail** sends one email to the upgrade address. The subject is the package, the day count and the event start time. The body has the event title, start time, the event's description (the milestone notes) and the event link.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve the calendar to its ID with the user's own Google Calendar connection; don't ask them to paste an ID you can look up.

| Setting                 | Where                                                                 | What goes there                                                                                              |
| ----------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `REPLACE_CALENDAR_ID`   | `config.ts`, `CALENDAR_ID`; `calendarid` in `triggers/event-start.ts` | The Google Calendar that holds the milestone events                                                          |
| `REPLACE_UPGRADE_EMAIL` | `config.ts`, `UPGRADE_EMAIL`                                          | The address the summaries go to. It must be the Gmail account's own address unless the user confirms another |

Also review the defaults with them: `PACKAGE_CODES` and `MILESTONE_DAYS` in `workflow.ts` (change the package codes to the user's own tier names), and the 15-minute lead time in the trigger (`time_length`, `time_unit`).

Confirm that event titles follow the package and day-count pattern (for example "PRO 30-day milestone"). An event whose title doesn't match is skipped.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` (the account that sends the summaries) to the user's Gmail connection, and `google-calendar` (the calendar the trigger watches) to their Google Calendar connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/event-start.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run these samples as draft test runs before publishing.

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

Check that the milestone run completed and that one email reached the upgrade address with the subject `PRO 30-day milestone (…)` and the event text in the body, and that the non-matching run returned `skipped: true` with no send. If run-status tools aren't available, check the result in Gmail directly. The user deletes the test events and emails, not the agent. Publish only after both checks pass, and confirm the trigger is active.

## Notes

- Events are matched by title, so titles must follow the package and day-count pattern. The day count is read from the title, since a trigger that fires before the event starts can't compute days since start.
- One email goes out per qualifying event; there is no batching.
- To log outreach, add a CRM or tracker row after the Gmail step with the outreach and owner. To post to a team chat instead of email, replace the email step with a message to a team channel.
- Never commit a real calendar ID or email address. Anyone who can read the workflow can see who gets the summaries.
