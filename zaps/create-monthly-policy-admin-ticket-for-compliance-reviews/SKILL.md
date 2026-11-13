---
name: create-monthly-policy-admin-ticket-for-compliance-reviews
description: Build a Zap on Zapier that opens a Zendesk ticket for the monthly policy admin compliance review, assigns it to the policy support queue and tags it for the audit trail. Use when a compliance or policy team needs a tracked ticket each month to confirm that the policy report was distributed, with a record kept for audit.
license: MIT
metadata:
  author: zapier
  summary: "On the 4th of each month, a Zendesk ticket is opened for the policy report review, assigned to your policy queue and tagged, so there is a tracked item and an audit trail."
  apps: "Schedule by Zapier, Zendesk"
  category: "Legal"
  job: "Compliance management"
  source: "https://zapier.com/automations/legal/compliance-management/compliance-task-tracking/create-monthly-policy-admin-ticket-for-compliance-reviews"
---

# Create monthly policy admin ticket for compliance reviews

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-monthly-policy-admin-ticket-for-compliance-reviews. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** `schedule`, every month, on day 4 at 3:00 PM in the account timezone.
2. **Zendesk** (`zendesk`) creates a ticket with the run month in the subject (`Monthly policy admin review YYYY-MM`), a description asking the reviewer to confirm distribution, and an external ID `compliance-review-YYYY-MM`.
3. **Zendesk** updates that ticket: it assigns the policy support queue (group), adds the audit tag `compliance-monthly-review`, and adds an internal note.

The Zap only opens and updates that month's ticket. It never closes or resolves one.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | What goes there                                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `SUPPORT_QUEUE_GROUP_ID` | The numeric Zendesk group ID of the policy support queue, as a string. Look it up with the user's Zendesk connection |

Also review the defaults with them:

- `TICKET_TYPE` is `task`. Other options are problem, incident or question.
- The 3:00 PM run uses the account timezone. The trigger's timezone override is empty; set one if the account timezone is not the one they want.
- `TICKET_SUBJECT_PREFIX` and `AUDIT_TAG` set the subject text and the audit tag.
- The first comment is public to the requester by default.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `zendesk` to the user's Zendesk connection for the account that owns the policy support queue. The trigger, `schedule`, needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/every-month.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

The trigger is a schedule, so there is no sample payload. Run it once as a draft test with an empty input, using a Zendesk test or sandbox group rather than the live queue.

Check that:

- one ticket exists with subject `Monthly policy admin review YYYY-MM` for the run month;
- the ticket is in the policy support queue, has the audit tag, and has the internal note;
- no other ticket changed.

If run-status tools aren't available, check the result in Zendesk directly. The user deletes the test ticket afterwards, not the agent.

## Notes

- Each month's ticket has a fixed `external_id`, but nothing stops a manual re-run from creating a second ticket for the same month.
- The first comment is a fixed template; no submission fields feed it.
- Zendesk tickets do not reliably return an `id` on create. The workflow then stops with `zendesk-ticket-id-missing`, so check the first real run.
- To extend it: post a Slack message to a team channel when a run fails or a confirmation is missing, or attach a stored report link to the ticket.
