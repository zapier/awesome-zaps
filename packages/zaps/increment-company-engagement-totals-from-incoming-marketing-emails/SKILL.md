---
name: increment-company-engagement-totals-from-incoming-marketing-emails
description: Build a Zapier Next Gen Zap that keeps a per-company engagement total for marketing emails. Each HubSpot email engagement event adds one to the total of every company it relates to, and creates the company's row in a Zapier Table the first time. Use when a campaign or sales team wants up-to-date engagement totals per company to prioritize follow-up, and tracks them in a Zapier Table.
metadata:
  author: zapier
  summary: "Every marketing email engagement adds one to the engagement count of the company it belongs to, so campaign managers see who is engaging most."
  apps: "HubSpot, Zapier Tables"
  category: "Data & Analytics"
  job: "Analytics automation"
  source: "https://zapier.com/automations/data-analytics/analytics-automation/customer-analytics/increment-company-engagement-totals-from-incoming-marketing-emails"
---

# Increment company engagement totals from incoming marketing emails

## What it does

1. **Trigger:** a new HubSpot email engagement event (HubSpot "New Email Event", all event types).
2. **Filter:** if the event has no related company IDs, the run stops and writes nothing.
3. **Loop:** for each company ID, once, in the order given:
   - **Zapier Tables** searches the tracking table for a row whose Company ID matches.
   - If a row is found, **Zapier Tables** adds `INCREMENT_AMOUNT` to its Engagement Count.
   - If not, **Zapier Tables** creates the row with that Company ID and an Engagement Count of `INCREMENT_AMOUNT`.
4. A company that fails is recorded in the run's output and doesn't stop the others.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top; everything else stays as written.

1. **Trigger:** HubSpot, New Email Event (`hubspot`, `email_event`). Leave the event type unset to take every email event, or set it to a single type such as `OPEN` or `CLICK` if you only count those. It needs a HubSpot connection.
2. **Connections** (each alias in the code is the app's slug):
   - `zapier-tables`: the Zapier Tables connection that owns the tracking table.
3. **Constants:**
   - `TABLE_ID`: the ID of the tracking table, from its URL.
   - `COMPANY_ID_FIELD`, `ENGAGEMENT_COUNT_FIELD`: the table's field keys (`data__f1`, `data__f2` in the test table). Check them with `inspect_zapier_actions` on the table, since they're generated per table.
   - `INCREMENT_AMOUNT`: what each engagement adds. Defaults to `"1"`.

## Ask the user

- Which Zapier Table holds the company engagement counts, and which columns are the Company ID and the Engagement Count?
- Which HubSpot email events should count: all of them, or only some (for example opens and clicks)?
- Which field in the HubSpot payload holds the related company IDs? The code reads `associatedCompanyIds`; if the payload uses another name, change it in the input schema and the filter before publishing.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, with two company IDs that aren't in the user's table yet, then run it again to see the increment path:

```json
{
  "associatedCompanyIds": ["install-test-co-1001", "install-test-co-1002"]
}
```

Confirm that the first run created one row per company with an Engagement Count of 1, and that the second run brought both to 2. Then delete the test rows from the table.

## Customize

- **Aggregate events into daily batches** instead of per-event increments, so each company is updated once per day.
- **Weight increments by engagement type**, for example a click counts more than an open.

## Notes

- Find-then-create is not atomic. If two events for a company that has no row arrive at the same moment, the table can end up with two rows for it, and each count only includes its own event.
- A HubSpot email event may relate to more than one company; each one is counted once per event.
- Anyone who can edit the table can change its counts, so keep the table private to the team that reads it.
