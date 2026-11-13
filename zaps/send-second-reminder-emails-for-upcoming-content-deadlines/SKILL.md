---
name: send-second-reminder-emails-for-upcoming-content-deadlines
description: Build a Zap on Zapier that emails a contributor a second reminder one week before their scheduled content event, using the contributor's address and name from the event. Use when an editorial or content team tracks submissions as Google Calendar events and wants a follow-up email to go out automatically before each publication date.
license: MIT
metadata:
  author: zapier
  summary: "One week before a scheduled content event, the contributor named in it gets a second reminder email with the date, unless they have already submitted."
  apps: "Google Calendar, Gmail"
  category: "Personal Productivity"
  job: "Email management"
  source: "https://zapier.com/automations/personal-productivity/email-management/email-follow-up-reminders/send-second-reminder-emails-for-upcoming-content-deadlines"
---

# Send second reminder emails for upcoming content deadlines

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-second-reminder-emails-for-upcoming-content-deadlines. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** an event on the calendar you choose starts one week from now (`google-calendar`, `event_start`).
2. **Filter:** the run stops without sending if the event description contains the submission marker, if no email address can be found in the description or title, or if the contributor's address is on your company domain.
3. **Message:** the contributor's email address is taken from the description (or the title if the description has none), and their name from the part of the title after a dash. The email gives the event title and date, and adds the location when the event has one.
4. **Gmail** sends the message from your connected account, with a blind copy to your internal address.

Nothing is sent to an internal address, or to a contributor who has already submitted.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve calendar names to IDs with the user's own Google Calendar connection; don't ask them to paste an ID you can look up.

| Setting                   | Where                                   | What goes there                                                            |
| ------------------------- | --------------------------------------- | -------------------------------------------------------------------------- |
| `REPLACE_CALENDAR_ID`     | `triggers/event-start.ts`, `calendarid` | The Google Calendar that holds the content deadlines                       |
| `REPLACE_INTERNAL_DOMAIN` | `config.ts`, `INTERNAL_DOMAIN`          | Your company's email domain, without the @. Contributors on it are skipped |
| `REPLACE_BCC_ADDRESS`     | `config.ts`, `BCC_ADDRESS`              | The address that gets a blind copy of every reminder. It can be their own  |

Review these defaults with the user:

- `SUBMISSION_MARKER` (`submission received`): the text in the event description that means a submission has arrived. Matched in any letter case.
- `TIMEZONE` (`America/New_York`): the time zone used for the date in the email.

Also confirm which Gmail account sends the reminders. It is bound as `gmail` in the build steps below.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` (the account that sends the reminders) to the user's Gmail connection, and `google-calendar` (the calendar the trigger watches) to their Google Calendar connection. Both apps need a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/event-start.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a sample event like this one, using a contributor address you control in place of the example:

```json
{
  "id": "evt_0001",
  "summary": "Essay - Jane Doe",
  "description": "Draft due for the November issue. Contact: jane@example.com",
  "location": "Remote",
  "start__dateTime": "2026-11-06T09:00:00-05:00"
}
```

Check that:

- One email goes to `jane@example.com`, with the subject naming the event and the date.
- The greeting reads `Hi Jane Doe`, and the body mentions the location because the sample has one.
- The blind copy reaches the address in `BCC_ADDRESS`.
- Adding the submission marker to the description makes the run skip with `submission-already-received`, and nothing is sent.
- Removing every email address makes the run skip with `no-contributor-email`, and nothing is sent.

If run-status tools aren't available, check the result in Gmail directly. Then publish, confirm the trigger is active, and tell the user the Zap is live. The user deletes the test emails; the agent does not.

## Notes

- Contributors are matched by the email address in the event, not by name. Only the first address in the description is used, and the title is searched only when the description has none.
- The trigger fires one week before each event starts.
- Anyone who can see the event can see the contributor's address. Keep sensitive contact details out of event descriptions.
- To send a different message when the event has a location, branch on `location` in `workflow.ts` instead of adding it to the same message.
- To create a task for the editor when no contributor address is found, add a step in place of the skip.
