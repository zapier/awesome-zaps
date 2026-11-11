---
name: add-new-hires-to-onboarding-sessions-and-notify-team
description: Build a Zapier Next Gen Zap that, when a new user is created in Google Workspace Admin, posts a provisioning reminder to your Slack onboarding channel, waits 24 hours, looks up the hire in BambooHR by email, and adds them to the recurring Google Calendar onboarding sessions for their hire date and location. Use when an HR, People Ops or IT team creates Google Workspace accounts for new hires and wants BambooHR data to drive onboarding session invites without manual calendar edits.
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

## What it does

1. **Trigger:** a new user is created in Google Workspace Admin.
2. **Slack** posts the hire's name and Google Workspace email to the onboarding channel, with a reminder for owners to finish provisioning. It posts as the Zapier bot, with mentions and link previews turned off.
3. **Wait:** 24 hours, so BambooHR has time to hold the hire's record.
4. **BambooHR** finds the employee by company email. If there is no match, the run stops. It never creates a BambooHR record.
5. **Location:** the BambooHR location picks which onboarding sessions to search for. A location with no entry uses the default search term.
6. **Google Calendar** finds onboarding sessions on the onboarding calendar that fall within 30 days after the hire date (or after today, if BambooHR has no hire date). Recurring sessions are expanded into single occurrences, and up to 25 are returned.
7. **Google Calendar** adds the hire as an attendee to each session they are not already on. One failed invite does not stop the others; the run's result counts added and failed invites.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and the trigger's fields (`get_trigger_fields`), and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** the files in this folder are the whole zap. `workflow.ts` is the workflow. It imports its settings from `config.ts` and each account from `connections/<alias>.ts`, and `triggers/` holds what starts it.

- **With the zap CLI:** `npx zap-pack add awesome-zaps/add-new-hires-to-onboarding-sessions-and-notify-team` (it makes a zap project if you aren't in one), then `npx zap-pack deploy add-new-hires-to-onboarding-sessions-and-notify-team` from that project. Deploy asks for each open setting and account, and sets the trigger.
- **With Zapier MCP:** publish every `.ts` file outside `triggers/` as `sourceFiles`, with three changes: write `config.ts` as plain values (`export const NAME = "value";`), write each `connections/<alias>.ts` as `export default "<alias>";`, and write each `@/name` import as a relative path ending in `.ts` (`./config.ts`, `./connections/<alias>.ts`). Set the trigger from the file in `triggers/`.

1. **Trigger:** Google Workspace Admin, New User (`google-workspace-admin`, `list_users`). It has no input fields and uses the Google Workspace Admin connection as its authentication ID. The account must be a Google Workspace admin who can read users.
2. **Connections** (each alias in the code is the app's slug):
   - `slack`: the user's Slack connection for the workspace that has the onboarding channel.
   - `bamboohr`: the BambooHR connection that can read employee records.
   - `google-calendar`: the Google Calendar connection with edit access to the onboarding calendar.
3. **Constants:**
   - `ONBOARDING_CHANNEL_ID`: the Slack channel ID of the onboarding channel.
   - `PROVISIONING_REMINDER`: the line added to the Slack message for account owners.
   - `HR_PROPAGATION_DELAY_SECONDS`: defaults to 24 hours.
   - `ONBOARDING_CALENDAR_ID`: the calendar ID that holds the recurring onboarding sessions (for example, the calendar's email address).
   - `DEFAULT_SESSION_SEARCH_TERM`: text in the onboarding session titles or descriptions. Defaults to `"New Hire Onboarding"`.
   - `LOCATION_SESSION_SEARCH_TERMS`: BambooHR location values mapped to the search term for that location's sessions, such as `"London": "Onboarding EMEA"`. Remove the placeholder entry if every location uses the default.
   - `SESSION_WINDOW_DAYS`: how many days after the hire date to look for sessions. Defaults to `30`.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user to check the trigger before relying on it.

## Ask the user

- Which Slack channel should get the new-account notice?
- Which Google Calendar holds the onboarding sessions, and what words do their titles share?
- Do different locations have different sessions? If so, which BambooHR location values map to which session titles?
- Is 24 hours long enough for the hire's BambooHR record to exist, and is 30 days after the hire date the right window?

## Test

A real run waits 24 hours before the BambooHR step. For a test run, set `HR_PROPAGATION_DELAY_SECONDS` to a few seconds, then set it back before publishing. Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP), with `primaryEmail` changed to the work email of a test employee who exists in BambooHR, and the onboarding calendar pointed at a test calendar:

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

Confirm that: one message with the name and email landed in the Slack channel, the run found the BambooHR employee, and the test address is now an attendee on each matching session in the window, and on no other event. Then remove the test attendee from those sessions.

## Customize

- **Urgent or VIP hires:** shorten the delay to 2 to 4 hours.
- **RSVP follow-up:** add a Slack reminder if the hire has not responded to a session invite within one week.

## Notes

- The Google Workspace Admin trigger fires for every new user, including service and shared accounts. Filter on `orgUnitPath` or the email pattern if those should be skipped.
- BambooHR matches on company email, so the Google Workspace address must already be the employee's work email in BambooHR.
- Google Calendar search matches the term anywhere in an event's title or description, so keep the search term specific to onboarding sessions.
- With recurring sessions expanded, the hire is added to single occurrences in the window, not the whole series.
- The Add Attendee(s) to Event action has no setting for invite emails. Whether Google emails the hire depends on the action's own behavior, so check the first real invite.
- Never commit a real channel ID, calendar ID or email address.
