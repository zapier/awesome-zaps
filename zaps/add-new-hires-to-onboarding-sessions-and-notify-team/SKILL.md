---
name: add-new-hires-to-onboarding-sessions-and-notify-team
description: Build a Zap on Zapier that, when a new user is created in Google Workspace Admin, posts a provisioning reminder to your Slack onboarding channel, waits 24 hours, looks up the hire in BambooHR by email, and adds them to the recurring Google Calendar onboarding sessions for their hire date and location. Use when an HR, People Ops or IT team creates Google Workspace accounts for new hires and wants BambooHR data to drive onboarding session invites without manual calendar edits.
license: MIT
metadata:
  author: zapier
  summary: "When a new Google Workspace account is created, your team gets a Slack heads-up, and a day later the hire is found in BambooHR and added to the onboarding sessions for their start date and location."
  apps: "Google Workspace Admin, BambooHR, Google Calendar, Slack"
  category: "Human Resources (HR)"
  job: "Talent pipeline management"
  source: "https://zapier.com/automations/human-resources-hr/talent-pipeline-management/employee-onboarding/add-new-hires-to-onboarding-sessions-and-notify-team"
---

# Add new hires to onboarding sessions and notify team

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/add-new-hires-to-onboarding-sessions-and-notify-team. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new user is created in Google Workspace Admin (`google-workspace-admin`, `list_users`, no settings).
2. **Slack** posts the hire's name and Google Workspace email to the onboarding channel, with a reminder for owners to finish provisioning. It posts as the Zapier bot, with mentions and link previews turned off.
3. **Wait:** 24 hours, so BambooHR has time to hold the hire's record.
4. **BambooHR** finds the employee by company email. If there is no match, the run stops.
5. **Location:** the BambooHR location picks which onboarding sessions to search for. A location with no entry uses the default search term.
6. **Google Calendar** finds onboarding sessions on the onboarding calendar that fall within 30 days after the hire date (or after today, if BambooHR has no hire date). Recurring sessions are expanded into single occurrences, and up to 25 are returned.
7. **Google Calendar** adds the hire as an attendee to each session they are not already on. One failed invite does not stop the others; the run's result counts added and failed invites.

The Zap never creates a BambooHR record, and it only adds people to sessions that already exist.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                          | What goes there                                                     |
| -------------------------------- | ------------------------------------------------------------------- |
| `REPLACE_ONBOARDING_CHANNEL_ID`  | The Slack channel where account owners are notified, by its ID (C…) |
| `REPLACE_ONBOARDING_CALENDAR_ID` | The Google Calendar that holds the recurring onboarding sessions    |

Also review the defaults with them:

- `DEFAULT_SESSION_SEARCH_TERM` (`config.ts`): text that onboarding session titles or descriptions share. Defaults to `"New Hire Onboarding"`.
- `PROVISIONING_REMINDER` (`config.ts`): the line added to the Slack message for account owners.
- `HR_PROPAGATION_DELAY_SECONDS` (`workflow.ts`): how long to wait before searching BambooHR. Defaults to 24 hours. Is that long enough for the hire's record to exist?
- `SESSION_WINDOW_DAYS` (`workflow.ts`): how many days after the hire date to look for sessions. Defaults to 30. Is that the right window?
- `LOCATION_SESSION_SEARCH_TERMS` (`workflow.ts`): BambooHR location values mapped to a session search term, such as `"London": "Onboarding EMEA"`. Empty by default, so every location uses the default. Do different locations have different sessions? If so, map each BambooHR location value to its session title.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` (the Slack workspace with the onboarding channel) to the user's Slack connection, `bamboohr` (can read employee records) to their BambooHR connection, and `google-calendar` (edit access to the onboarding calendar) to their Google Calendar connection. The trigger uses `google-workspace-admin`, which must be a Google Workspace admin who can read users. Every app in this zap needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/list-users.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

A real run waits 24 hours before the BambooHR step. For a test run, set `HR_PROPAGATION_DELAY_SECONDS` to a few seconds, and set it back before publishing. Run this sample once as a draft test, with `primaryEmail` set to the work email of a test employee who exists in BambooHR, and the onboarding calendar set to a test calendar:

```json
{
  "id": "100000000000000000001",
  "primaryEmail": "test.hire@example.com",
  "name": {
    "givenName": "Test",
    "familyName": "Hire",
    "fullName": "Test Hire"
  },
  "orgUnitPath": "/"
}
```

Check that one message with the name and email landed in the Slack channel, that the run found the BambooHR employee, and that the test address is an attendee on each matching session in the window and on no other event. If run-status tools aren't available, check the result in Slack and Google Calendar directly. Ask the user to delete the test message and remove the test attendee; the agent doesn't delete test data. Then publish, and tell the user to confirm the trigger is active before relying on it.

## Notes

- The Google Workspace Admin trigger fires for every new user, including service and shared accounts. Filter on `orgUnitPath` or the email pattern if those should be skipped.
- BambooHR matches on company email, so the Google Workspace address must already be the employee's work email.
- Google Calendar search matches the term anywhere in an event's title or description, so keep the search term specific to onboarding sessions.
- With recurring sessions expanded, the hire is added to single occurrences in the window, not the whole series.
- The Add Attendee(s) to Event action has no setting for invite emails. Whether Google emails the hire depends on the action's own behavior, so check the first real invite.
- To customize: shorten the delay to 2 to 4 hours for urgent or VIP hires, or add a Slack reminder if the hire hasn't responded to a session invite within a week.
- Never commit a real channel ID, calendar ID or email address.
