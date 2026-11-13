---
name: send-performance-review-booking-reminder-to-team-leaders
description: Build a Zap on Zapier that emails managers a booking reminder twice a year, so their performance reviews are scheduled before the appraisal period. Use when an HR team wants a standing, twice-yearly nudge to team leaders to book reviews, sent from a Gmail account.
license: MIT
metadata:
  author: zapier
  summary: "Twice a year, every manager on your list gets an email reminding them to book their team's performance reviews before the appraisal period."
  apps: "Schedule by Zapier, Gmail"
  category: "Human Resources (HR)"
  job: "Performance management"
  source: "https://zapier.com/automations/human-resources-hr/performance-management/performance-review-cycles/send-performance-review-booking-reminder-to-team-leaders"
---

# Send performance review booking reminder to team leaders

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-performance-review-booking-reminder-to-team-leaders. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** Schedule by Zapier, Custom Frequency (`schedule`, `custom_frequency`). It fires every 6 months, on the start date, at the set time of day.
2. **Gmail** sends one email from the connected account to the manager list, with the reminder subject and body.

Each run sends a real email to every address on the manager list.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                 | Where                                        | What goes there                                                               |
| ----------------------- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| `REPLACE_MANAGER_EMAIL` | `workflow.ts`, `MANAGER_EMAILS`              | The managers who get the reminder, as email addresses. One entry per manager. |
| `REPLACE_START_DATE`    | `triggers/custom-frequency.ts`, `start_date` | The first reminder date, `YYYY-MM-DD`. It must be in the future.              |

Defaults worth reviewing with them:

- `freq` `"1"` with `interval` `6` sends the reminder twice a year. Change them for another cadence.
- `hod` `"9:00 AM"` is the time of day. The trigger runs on the account's timezone; set a timezone override on the trigger if the managers are in another zone.
- `SUBJECT` (`config.ts`) and `BODY` (`workflow.ts`) are the reminder text.

Consent and prerequisite questions:

- Should the reminder be sent, or created as a draft for review first? The shipped version sends.
- Should a review document be attached or linked? That needs a staff identifier the trigger does not provide, so it is not built.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` to the user's Gmail connection for the HR sender address, the account the reminder is sent from. Schedule by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/custom-frequency.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test. The workflow takes no input, so the test input is `{}`. Before the test run, set the manager list to an address the user controls, such as the connected Gmail account, so the test email goes only there.

Check that one email arrived in that Gmail account with the subject and body from the code. The result should be `{ sent, recipients, messageId }` with `sent` true. If run-status tools aren't available, check the Gmail account directly. Then set the manager list to the real managers, publish, confirm the trigger is active, and ask the user to delete the test email.

## Notes

- Every run is a real email to everyone on the manager list, so set the real list before publishing.
- The trigger's start date must be in the future for the first run to fire on schedule.
- To notify only managers with direct reports, filter the list against your HRIS before sending.
- To send calendar invites instead of email, replace the Gmail step with a calendar-event step.
- Keep real manager addresses out of committed code.
