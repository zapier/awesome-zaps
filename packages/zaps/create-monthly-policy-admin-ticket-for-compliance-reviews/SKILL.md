---
name: create-monthly-policy-admin-ticket-for-compliance-reviews
description: Open a Zendesk ticket for the monthly policy admin compliance review, assign it to the policy support queue and tag it for the audit trail. Use when a compliance or policy team needs a tracked ticket each month to confirm that the policy report was distributed, with a record kept for audit.
metadata:
  author: zapier
  summary: "On the 4th of each month, a Zendesk ticket is opened for the policy report review, assigned to your policy queue and tagged, so there is a tracked item and an audit trail."
  apps: "Schedule by Zapier, Zendesk"
  category: "Legal"
  job: "Compliance management"
  source: "https://zapier.com/automations/legal/compliance-management/compliance-task-tracking/create-monthly-policy-admin-ticket-for-compliance-reviews"
---

# Create monthly policy admin ticket for compliance reviews

## What it does

1. **Trigger:** Schedule by Zapier, Every Month, on day 4 at 3:00 PM (account timezone).
2. **Zendesk** creates a ticket with the run month in the subject (`Monthly policy admin review YYYY-MM`), a description asking the reviewer to confirm distribution, and an external ID `compliance-review-YYYY-MM`.
3. **Zendesk** updates that ticket: it assigns the policy support queue (group), adds the audit tag `compliance-monthly-review`, and adds an internal note.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Schedule by Zapier, Every Month (`schedule`, `everyMonth`, `dom: ["4"]`, `hod: "3:00 PM"`). It needs no connection, so its `authentication_id` is `null`. The timezone override is left empty, so the account timezone applies.
2. **Connections** (each alias in the code is the app's slug):
   - `zendesk`: the user's Zendesk connection, for the account that owns the policy support queue.
3. **Constants:**
   - `TICKET_SUBJECT_PREFIX`: the subject text before the month.
   - `TICKET_TYPE`: the Zendesk ticket type, `task` by default.
   - `SUPPORT_QUEUE_GROUP_ID`: the numeric Zendesk group ID of the policy support queue. This is a placeholder in the copy handed back.
   - `AUDIT_TAG` and `AUDIT_NOTE`: the audit tag and the internal note.
4. Test with the steps below, then publish, wait until the trigger is active, and leave it enabled only if the user wants the schedule to run.

## Ask the user

- Which Zendesk group is the policy support queue? Its numeric ID goes in `SUPPORT_QUEUE_GROUP_ID`.
- Which timezone should the 3:00 PM run use? The default is the account timezone; set a timezone override if it differs.
- Should the ticket type be something other than `task` (problem, incident or question)?
- Should the first comment be public to the requester, or internal only? The default is public.

## Test

The trigger is a schedule, so there is no sample payload. Run the draft test (`run_workflow_draft`) with an empty input, using a Zendesk test or sandbox group rather than the live queue.

Check that:

- one ticket exists with subject `Monthly policy admin review YYYY-MM` for the run month;
- the ticket is in the policy support queue, has the audit tag, and has the internal note;
- no other ticket changed.

Close or delete the test ticket afterwards.

## Customize

- **Notify on failure:** add a Slack notification to a team channel for failed or missing confirmations.
- **Attach the report link:** attach a stored report link to the ticket if a report URL is available.

## Notes

- A schedule has no report reference or submission ID, so the spec's dedupe step is replaced by a fixed `external_id` per month. The schedule fires once a month, so duplicates are unlikely, but nothing stops a manual re-run from creating a second ticket.
- The spec's "map key submission fields into the first comment" has no source here; the description is a fixed template.
- Zendesk tickets do not reliably return an `id` field on create; the workflow stops with `zendesk-ticket-id-missing` if it does not. Check the first real run.
