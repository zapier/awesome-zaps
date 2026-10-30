---
name: create-daily-crawl-health-check-ticket-for-monitoring
description: Build a Zapier Next Gen Zap that opens a Zendesk ticket every morning at 9:00 AM with a templated crawl health checklist, so monitoring staff can triage crawl issues from one ticket. Use when a team runs a daily crawl or site-health check and wants a consistent ticket each day instead of a manual one.
metadata:
  author: zapier
  summary: "Every morning a new Zendesk ticket is opened with a crawl health checklist and the run time, so monitoring staff start the day with the same triage steps."
  apps: "Schedule by Zapier, Zendesk"
  category: "IT"
  job: "IT service management"
  source: "https://zapier.com/automations/it/it-service-management/it-ticketing/create-daily-crawl-health-check-ticket-for-monitoring"
---

# Create daily crawl health check ticket for monitoring

## What it does

1. **Trigger:** Schedule by Zapier fires every day at 9:00 AM (account timezone), weekends included.
2. **Code step:** builds the ticket subject (`Daily crawl health check: <date>`) and a checklist comment with the run time and a fixed list of checklist items. Plain code, no app call.
3. **Zendesk** creates one ticket with that subject and checklist as its first comment, assigned to the monitoring group, normal priority, type incident, with the monitoring tags. The requester is your service account.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Schedule by Zapier, `everyDay` (`schedule`). It needs no connection, so its `authentication_id` is `null`. Params: `hod: "9:00 AM"`, `weekends: "yes"`, no timezone override.
2. **Connections** (each alias in the code is the app's slug):
   - `zendesk`: the user's Zendesk connection, for the account that owns the monitoring queue.
3. **Constants** (at the top of `workflow.ts`):
   - `REQUESTER_NAME`, `REQUESTER_EMAIL`: the service account the tickets are requested by.
   - `MONITORING_GROUP_ID`: the numeric Zendesk group ID. Replace the `0` placeholder.
   - `TICKET_PRIORITY`, `TICKET_TYPE`, `TICKET_TAGS`: priority, type and tags on every ticket.
   - `FIRST_COMMENT_PUBLIC`: whether the checklist comment is visible to the requester.
   - `CHECKLIST_ITEMS`: the checklist lines in the ticket body.

## Ask the user

- Which Zendesk group should own the tickets, and what is its numeric ID?
- Which service account is the requester (name and email)?
- Should the tickets use a different priority, type or tags than normal, incident and `crawl-health,monitoring,daily-check`?
- Does the checklist need different items from the four placeholders in `CHECKLIST_ITEMS`?
- Is the account timezone the one to run at 9:00 AM? If not, set a timezone override on the trigger.

## Test

Once the Zendesk connection exists, run it as a draft test before publishing: `run_workflow_draft` with an empty input, since the trigger sends no fields the code reads. Then check that:

- one ticket appears in the monitoring group with the subject `Daily crawl health check: <today>`;
- its first comment lists the run time and the checklist items;
- the requester, priority, type and tags match the constants.

Close or delete the test ticket afterwards.

## Customize

- **Attach logs or monitoring snapshots:** add a step that pulls logs from cloud storage or a monitoring tool and attaches them to the ticket.
- **Post a link on-call:** after the ticket is created, post its link to the on-call channel, so it is seen right away.

## Notes

- The Zendesk ticket action needs a connection before it can run. This file was built without one.
- The checklist is a fixed template. It does not read crawl diagnostics, because the source automation did not name a diagnostics feed.
- Fill in every `YOUR_…` value or `0` placeholder before deploying. A ticket cannot be created with a placeholder group.
