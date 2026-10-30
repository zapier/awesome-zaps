---
name: send-board-meeting-prep-reminders-to-admin-stakeholders
description: Build a Zapier Next Gen Zap that emails meeting stakeholders a reminder with the agenda and packet submission link every month, before each board meeting. Use when an executive or admin team needs board packet contributors reminded on a fixed schedule.
metadata:
  author: zapier
  summary: "Each month, stakeholders get an email reminding them to submit board packet materials, with the agenda link, so the packet is ready on time."
  apps: "Schedule by Zapier, Gmail"
  category: "Executives"
  job: "Investor board reporting"
  source: "https://zapier.com/automations/executives/investor-board-reporting/board-meeting-preparation/send-board-meeting-prep-reminders-to-admin-stakeholders"
---

# Send board meeting prep reminders to admin stakeholders

## What it does

1. **Trigger:** Schedule by Zapier, every month on day 1 at 9:00 AM (account timezone).
2. **Gmail** sends one plain-text email to the recipient with the subject `Board meeting prep: <meeting title> on <meeting date>`, a reminder to submit board packet materials, and the agenda and submission link.
3. If the agenda link constant is empty, the run stops and sends nothing.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Schedule by Zapier, Every Month (`schedule` / `everyMonth`), with `dom: ["1"]` and `hod: "9:00 AM"`. No connection, so `authentication_id` is `null`. Change the day and time to match your meeting cadence.
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the Gmail account that will send the reminder.
3. **Constants:**
   - `RECIPIENT`: the stakeholder address or Google Group to receive the reminder.
   - `MEETING_TITLE`: the meeting name shown in the subject and body.
   - `MEETING_DATE`: the meeting date, written as you want it to read.
   - `AGENDA_LINK`: the agenda and packet submission page. Leave it empty to send nothing.
4. Test with the steps below, then publish, confirm the trigger is active, and tell the user it is live.

## Ask the user

- Who should receive the reminder: one address, or a Google Group?
- Which meeting title and date should the email show? These are constants, not looked up from a calendar.
- Where is the agenda and packet submission page?
- Which day of the month and what time should it send?
- Should the mail come from a departmental address? The Gmail connection sends from its default address; an alias would need to be added to that Gmail account first.

## Test

Run as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. The trigger takes no input, so the test input is `{}`. Use these constants for the test:

- `RECIPIENT`: the connected Gmail account's own address
- `MEETING_TITLE`: `[install-test] Board meeting`
- `MEETING_DATE`: `November 12, 2026`
- `AGENDA_LINK`: `https://example.com/install-test-agenda`

Check that exactly one email arrives in the connected inbox with subject `Board meeting prep: [install-test] Board meeting on November 12, 2026`, the reminder sentence, and the agenda link. Delete the test email afterwards. Then set the real constants before publishing.

## Customize

- **Notify a coordinator on Slack:** add a Slack message step after the email, to the meeting coordinator's channel.
- **Split copy by audience:** add a path so executive assistants and general contributors get different text.

## Notes

- The spec's Google Calendar lookup is not built. The workflow sends a reminder whenever it runs; it does not check that a meeting is actually scheduled that month.
- Schedule by Zapier uses the account timezone unless you set a timezone override in the trigger.
- Never commit a real email address or agenda link. Anyone who can edit this workflow can change who receives it.
