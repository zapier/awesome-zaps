---
name: add-new-member-to-onboarding-meeting-attendees-instantly
description: Build a Zap on Zapier that adds a new member as an attendee on a configured Outlook onboarding meeting when their details arrive by webhook, so they receive the calendar invite. Use when a team onboards people into a fixed Outlook meeting and wants new members added without anyone editing the invite by hand.
license: MIT
metadata:
  author: zapier
  summary: "When a new member's details arrive, they're added to your onboarding meeting in Outlook, so they get the invite without anyone adding them by hand."
  apps: "Webhooks by Zapier, Microsoft Outlook"
  category: "Business Owners"
  job: "Scheduling coordination"
  source: "https://zapier.com/automations/business-owners/scheduling-coordination/appointment-scheduling/add-new-member-to-onboarding-meeting-attendees-instantly"
---

# Add new member to onboarding meeting attendees instantly

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/add-new-member-to-onboarding-meeting-attendees-instantly. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new member payload arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). The workflow reads `email` and `name` from it. Without an email it stops.
2. **Microsoft Outlook** searches the calendar window for the onboarding meeting, matching the event title exactly. If none matches, the run stops and changes nothing.
3. **Microsoft Outlook** adds the member's email as an attendee of that event. Existing attendees are kept, and if the address is already on the event, nothing is added.

The Zap only adds the new member. It never removes anyone or changes the meeting's other details.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                           | What goes there                                                                                 |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| `REPLACE_ONBOARDING_EVENT_TITLE`  | The onboarding meeting's title, exactly as Outlook shows it                                     |
| `REPLACE_ONBOARDING_WINDOW_START` | The start of a window that covers the meeting's date, as ISO 8601 with an offset                |
| `REPLACE_ONBOARDING_WINDOW_END`   | The end of that window, as ISO 8601 with an offset. Widen it if the meeting's date is uncertain |

Also review the default with them: `CALENDAR_ID` is blank, which searches the connected account's default calendar. Ask whether the meeting is on a different Outlook calendar, and set its ID if so.

Ask what keys the intake webhook sends for the member's email and name. The workflow reads `email` and `name`; if the sender uses other keys, change them before building.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `microsoft-outlook` to the user's Microsoft Outlook connection for the account whose calendar holds the onboarding meeting. The account must be able to edit that event. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with the connected Outlook account's own address as `email`, so the invite goes only to that account:

```json
{
  "email": "<the connected Outlook address>",
  "name": "Test Member"
}
```

Set the title and window to a test meeting named `[install-test] …` on the user's own calendar, created for this run. Check that the output has `added: true` and an `eventId`, and that the event's attendees now include the address. Run it again with the same address and check for `already-attendee`, with nothing added. If run-status tools aren't available, check the result in Outlook directly. Ask the user to delete the test meeting; the agent won't delete it. Then publish, confirm the trigger is active, and do the real thing once.

## Notes

- The Outlook search matches substrings, so the workflow keeps only events whose subject equals the title exactly.
- Outlook's invite takes only the address. The member's name is returned in the run output but is not set on the attendee.
- The output shapes of the Outlook search and add actions were not read from a live run; the first test run confirms them.
- To send a confirmation email after the member is added, add a send-email step after the add step.
- To create a follow-up task when no matching meeting is found, add a task step in place of the `event-not-found` return.
