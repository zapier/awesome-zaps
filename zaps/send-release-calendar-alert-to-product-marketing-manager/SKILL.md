---
name: send-release-calendar-alert-to-product-marketing-manager
description: Build a Zap on Zapier that sends the event owner a Slack direct message with the time and link when a release event is added to a Google Calendar. Use when a product team plans launches on a shared calendar and wants the product marketing owner alerted quickly enough to start launch comms.
license: MIT
metadata:
  author: zapier
  summary: "When a release goes on the calendar, the owner gets a Slack message with the title, time and link so launch comms can start right away."
  apps: "Google Calendar, Slack"
  category: "Product"
  job: "Product launch management"
  source: "https://zapier.com/automations/product/product-launch-management/launch-coordination/send-release-calendar-alert-to-product-marketing-manager"
---

# Send release calendar alert to product marketing manager

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-release-calendar-alert-to-product-marketing-manager. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new event is created on the release calendar (`google-calendar`, `new_event`).
2. The workflow stops without doing anything unless the event title contains a release keyword (`release` or `launch` by default).
3. **Slack** looks up the Slack user whose email matches the event organizer. If there is no match, the fallback recipient is used.
4. The workflow formats the event's date and time, then **Slack** sends that person a direct message with the event title, the time, the event description (tags removed) and the calendar link.

The Zap only sends a direct message. It never changes the calendar event, and it does not ping anyone with mentions unless `SEND_MENTIONS` is `true`.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                          | Where                                 | What goes there                                                                                                     |
| -------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_CALENDAR_ID`            | `triggers/new-event.ts`, `calendarid` | The Google Calendar that holds the release events                                                                   |
| `REPLACE_FALLBACK_SLACK_USER_ID` | `config.ts`, `FALLBACK_SLACK_USER_ID` | The Slack user who gets the alert when no one matches the organizer's email: the team's launch owner, not a channel |

Also review the defaults with them, in `workflow.ts`:

- `RELEASE_KEYWORDS` (`["release", "launch"]`): the words that mark an event title as a release. Matching is case-insensitive. Keep the defaults unless they name others.
- `SEND_MENTIONS` (`false`): keep it off so the message never notifies anyone. Set it to `true` only if they want `@mentions` in the text to ping people.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` (the user's own workspace; it must look up users by email and send direct messages) to the user's Slack connection. Bind `google-calendar` (the account that can read the release calendar) for the trigger. Both apps use a connection; this Zap has no app that needs none.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-event.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's `calendarid` to the calendar the user chose. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a release event that exists on the user's own calendar:

```json
{
  "summary": "Release: Widgets 2.0 (beta)",
  "description": "Beta launch of Widgets 2.0 to design partners.",
  "htmlLink": "https://www.google.com/calendar/event?eid=EXAMPLE",
  "organizer": { "email": "owner@example.com" },
  "start": {
    "dateTime": "2026-11-03T10:00:00-05:00",
    "timeZone": "America/New_York"
  },
  "end": {
    "dateTime": "2026-11-03T10:30:00-05:00",
    "timeZone": "America/New_York"
  }
}
```

Check that:

- The run continues past the filter, because the title contains "Release".
- The Slack lookup finds the user whose email is `owner@example.com`, or falls back to the fallback recipient if none exists.
- The direct message arrives in that Slack user's DMs with the title, a readable time (for example `Mon, Nov 3, 2026, 10:00 AM – 10:30 AM EST`), the description and the link, and it does not notify anyone.
- A non-release title such as "Team lunch" stops the run without sending anything.

If run-status tools aren't available, check the result in Slack directly. Then publish, confirm the trigger is active, and ask the user to delete the test message. The user deletes test data, not the agent.

## Notes

- Matching uses the organizer's email, so it only works when the organizer has the same email in Slack. Google Calendar events without a start time are sent with "Time not set" as the time.
- To send to a team channel instead of a DM for cross-functional launches, change the Slack action to a channel message. To create a follow-up task in the team's project tool, add a step that creates it.
- Never commit a real Slack user ID or calendar ID into a shared copy of this file.
