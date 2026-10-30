---
name: send-performance-review-booking-reminder-to-team-leaders
description: Build a Zapier Next Gen Zap that emails managers a booking reminder twice a year, so their performance reviews are scheduled before the appraisal period. Use when an HR team wants a standing, twice-yearly nudge to team leaders to book reviews, sent from a Gmail account.
metadata:
  author: zapier
  summary: "Twice a year, every manager on your list gets an email reminding them to book their team's performance reviews before the appraisal period."
  apps: "Schedule by Zapier, Gmail"
  category: "Human Resources (HR)"
  job: "Performance management"
  source: "https://zapier.com/automations/human-resources-hr/performance-management/performance-review-cycles/send-performance-review-booking-reminder-to-team-leaders"
---

# Send performance review booking reminder to team leaders

## What it does

1. **Trigger:** Schedule by Zapier, Custom Frequency. It fires every 6 months, on the configured start date, at the configured time of day.
2. **Gmail** sends one email from the connected account to the manager list, with the reminder subject and body.

The workflow returns `{ sent, recipients, messageId }`.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Schedule by Zapier, Custom Frequency (`schedule` / `custom_frequency`). It needs no connection, so its `authentication_id` is `null`. Its parameters are:
   - `freq`: `"1"` (monthly), with `interval`: `6`, so it fires twice a year.
   - `start_date`: the first run, in `YYYY-MM-DD` form. The tested value was `2027-01-15`; change it to your first reminder date.
   - `hod`: the time of day, 12-hour format. The tested value was `"9:00 AM"`.
   - The trigger runs on the account's timezone. Set a timezone override in the trigger if the managers are in another zone.
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the Gmail connection for the HR sender address. The tested value was the `you@example.com` work account.
3. **Constants** (at the top of `workflow.ts`):
   - `MANAGER_EMAILS`: the managers who receive the reminder, as a list of email addresses.
   - `SUBJECT`: the subject line of the reminder.
   - `BODY`: the plain-text body of the reminder.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user it is live.

## Ask the user

- Which managers should get the reminder, and from which Gmail account? Put the addresses in `MANAGER_EMAILS`.
- What are the two reminder dates each year? Set `start_date` and `freq`/`interval` on the trigger to match.
- What time of day should the reminder go out, and in which timezone?
- Should the reminder be sent, or created as a draft for review first? The shipped version sends.
- Should a review document be attached or linked? That needs a staff identifier the trigger does not provide, so it is not built.

## Test

Run as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. The workflow takes no input, so the test input is `{}`. Before running, point `MANAGER_EMAILS` at an address you control, such as the connected Gmail account, so the test email goes only there.

Confirm that one email arrived in that Gmail account with the subject and body above. Then remove the test address from `MANAGER_EMAILS` and republish, or ask the user to, before the first real scheduled run.

## Customize

- **Only notify managers with direct reports:** filter `MANAGER_EMAILS` against your HRIS before sending.
- **Calendar invites instead of email:** replace the Gmail step with a calendar-event step.

## Notes

- Every reminder is a real email. Anyone on `MANAGER_EMAILS` will receive it on each scheduled run.
- The trigger's start date must be in the future for the first run to fire on schedule.
- Never commit real manager addresses. Keep them only in the workflow's constants.
