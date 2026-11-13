---
name: create-daily-crawl-health-check-ticket-for-monitoring
description: Build a Zap on Zapier that opens a Zendesk ticket every morning at 9:00 AM with a templated crawl health checklist, so monitoring staff can triage crawl issues from one ticket. Use when a team runs a daily crawl or site-health check and wants a consistent ticket each day instead of a manual one.
license: MIT
metadata:
  author: zapier
  summary: "Every morning a new Zendesk ticket is opened with a crawl health checklist and the run time, so monitoring staff start the day with the same triage steps."
  apps: "Schedule by Zapier, Zendesk"
  category: "IT"
  job: "IT service management"
  source: "https://zapier.com/automations/it/it-service-management/it-ticketing/create-daily-crawl-health-check-ticket-for-monitoring"
---

# Create daily crawl health check ticket for monitoring

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-daily-crawl-health-check-ticket-for-monitoring. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** `schedule` (`everyDay`) fires every day at 9:00 AM in the account timezone, weekends included.
2. **Code:** builds the ticket subject (`Daily crawl health check: <date>`) and a checklist comment with the run time and a fixed list of checklist items. No app call.
3. **Zendesk** (`zendesk`) creates one ticket with that subject and checklist as its first comment, assigned to the monitoring group, with the priority, type and tags set in `config.ts`. The requester is the service account set there.

The checklist is a fixed template: the Zap does not read crawl diagnostics.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                   | What goes there                                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_REQUESTER_NAME`  | The service account the tickets are requested by: look up its name in Zendesk (`config.ts`)                                   |
| `REPLACE_REQUESTER_EMAIL` | That same service account's email, looked up in Zendesk (`config.ts`)                                                         |
| `MONITORING_GROUP_ID`     | The numeric ID of the Zendesk group that owns the tickets, looked up in Zendesk (`workflow.ts`, replaces the `0` placeholder) |

Also review the defaults with them: `TICKET_PRIORITY` (normal), `TICKET_TYPE` (incident), `TICKET_TAGS` (`crawl-health,monitoring,daily-check`), `FIRST_COMMENT_PUBLIC` (`no`, so the checklist is internal), and the checklist items in `workflow.ts`. The trigger runs at 9:00 AM in the account timezone; if that is not the time they want, set a timezone override on the trigger.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `zendesk` to the user's Zendesk connection for the account that owns the monitoring queue. Schedule by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/every-day.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with an empty input `{}`, since the trigger sends no fields the code reads. Check that:

- one ticket appears in the monitoring group with the subject `Daily crawl health check: <today>`;
- its first comment lists the run time and the checklist items;
- the requester, priority, type and tags match the settings.

If run-status tools aren't available, check the result in Zendesk directly. Ask the user to close or delete the test ticket; the agent doesn't delete test data. Then publish and confirm the trigger is active.

## Notes

- The checklist is a fixed template, so it carries no crawl data. To add it, pull logs or a monitoring snapshot in a step before the ticket and attach them.
- To post the new ticket's link to an on-call channel, add a step after the ticket is created.
