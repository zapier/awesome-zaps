---
name: send-board-meeting-prep-reminders-to-admin-stakeholders
description: Build a Zap on Zapier that emails meeting stakeholders a reminder with the agenda and packet submission link every month, before each board meeting. Use when an executive or admin team needs board packet contributors reminded on a fixed schedule.
license: MIT
metadata:
  author: zapier
  summary: "Each month, stakeholders get an email reminding them to submit board packet materials, with the agenda link, so the packet is ready on time."
  apps: "Schedule by Zapier, Gmail"
  category: "Executives"
  job: "Investor board reporting"
  source: "https://zapier.com/automations/executives/investor-board-reporting/board-meeting-preparation/send-board-meeting-prep-reminders-to-admin-stakeholders"
---

# Send board meeting prep reminders to admin stakeholders

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-board-meeting-prep-reminders-to-admin-stakeholders. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** `schedule`, `everyMonth`: every month on day 1 at 9:00 AM in the account timezone.
2. **Gmail** sends one plain-text email to the recipient with the subject `Board meeting prep: <meeting title> on <meeting date>`, a reminder to submit board packet materials, and the agenda and submission link.
3. If the agenda link is empty, the run stops and sends nothing.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting        | What goes there                                                       |
| -------------- | --------------------------------------------------------------------- |
| `RECIPIENT`    | The stakeholder address or Google Group that receives the reminder    |
| `MEETING_DATE` | The board meeting date, written the way it should read in the email   |
| `AGENDA_LINK`  | The agenda and packet submission page. Leave it empty to send nothing |

Also review these defaults with them:

- `MEETING_TITLE` (`Board meeting`): the meeting name shown in the subject and body.
- The send day and time in `triggers/every-month.ts` (day 1 at 9:00 AM): change them to match the meeting cadence.

Prerequisite question: should the mail come from a departmental address? The Gmail connection sends from its default address, so an alias must be added to that Gmail account first.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` to the user's Gmail connection, the account that sends the reminder. Schedule by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/every-month.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test run (`run_workflow_draft`) before publishing. The trigger takes no input, so the test input is `{}`. Use these values for the test:

- `RECIPIENT`: the connected Gmail account's own address
- `MEETING_TITLE`: `[install-test] Board meeting`
- `MEETING_DATE`: `November 12, 2026`
- `AGENDA_LINK`: `https://example.com/install-test-agenda`

Check that exactly one email arrives in the connected inbox with subject `Board meeting prep: [install-test] Board meeting on November 12, 2026`, the reminder sentence, and the agenda link. If run-status tools aren't available, check the result in Gmail directly. The user deletes the test email, not the agent. Then set the real values, publish, and confirm the trigger is active.

## Notes

- The Zap doesn't read a calendar. It sends a reminder whenever it runs, without checking that a meeting is scheduled that month.
- Schedule by Zapier uses the account timezone unless you set a timezone override in the trigger.
- Never commit a real email address or agenda link. Anyone who can edit this workflow can change who receives it.
- To notify a coordinator, add a Slack message step after the email. To vary copy by audience, add a path so executive assistants and contributors get different text.
