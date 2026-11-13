---
name: increment-company-engagement-totals-from-incoming-marketing-emails
description: Build a Zap on Zapier that keeps a per-company engagement total for marketing emails. Each HubSpot email engagement event adds one to the total of every company it relates to, and creates the company's row in a Zapier Table the first time. Use when a campaign or sales team wants up-to-date engagement totals per company to prioritize follow-up, and tracks them in a Zapier Table.
license: MIT
metadata:
  author: zapier
  summary: "Every marketing email engagement adds one to the engagement count of the company it belongs to, so campaign managers see who is engaging most."
  apps: "HubSpot, Zapier Tables"
  category: "Data & Analytics"
  job: "Analytics automation"
  source: "https://zapier.com/automations/data-analytics/analytics-automation/customer-analytics/increment-company-engagement-totals-from-incoming-marketing-emails"
---

# Increment company engagement totals from incoming marketing emails

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/increment-company-engagement-totals-from-incoming-marketing-emails. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new HubSpot email engagement event (`hubspot`, `email_event`). It counts every event type unless one is set.
2. **Filter:** if the event has no related company IDs, the run stops and writes nothing.
3. **Loop:** for each company ID, once, in the order given:
   - **Zapier Tables** searches the tracking table for a row whose Company ID matches.
   - If a row is found, **Zapier Tables** adds `INCREMENT_AMOUNT` to its Engagement Count.
   - If not, **Zapier Tables** creates the row with that Company ID and an Engagement Count of `INCREMENT_AMOUNT`.
4. A company that fails is recorded in the run's output and doesn't stop the others.

The Zap only reads and writes the tracking table. It sends nothing to HubSpot.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting            | What goes there                                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_TABLE_ID` | The Zapier Table that holds the company engagement counts, the one with Company ID and Engagement Count columns. Look it up with the user's Zapier Tables connection. |

Also review the defaults with them:

- `COMPANY_ID_FIELD` and `ENGAGEMENT_COUNT_FIELD`: the table's field keys, which are generated per table (`data__f1` and `data__f2` in the test table). Check them against the table before the first test run.
- `INCREMENT_AMOUNT` (`"1"`): how much each engagement adds.
- The trigger's event type in `triggers/email-event.ts`: unset counts every HubSpot email event. Set it to one type, such as `OPEN` or `CLICK`, to count only that type.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `zapier-tables` (the Zapier Tables connection that owns the tracking table) and `hubspot` (the HubSpot account the trigger watches for email events).
2. **Source:** publish `workflow.ts` and `config.ts`, with `REPLACE_TABLE_ID` replaced by the user's answer. `triggers/email-event.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match. The create step writes `new__data__f1` and `new__data__f2` directly, so match those to the table's keys too.

## Test it

Run this sample as a draft test (`run_workflow_draft`) before publishing, with two company IDs that aren't in the table yet:

```json
{
  "associatedCompanyIds": ["install-test-co-1001", "install-test-co-1002"]
}
```

The first run should create one row per company, each with an Engagement Count of 1. Run it again: both rows should reach 2. If run-status tools aren't available, check the rows in Zapier Tables directly. Publish only after both runs pass. The user deletes the test rows, not the agent.

## Notes

- Find-then-create is not atomic. If two events for a company with no row arrive at the same moment, the table can end up with two rows for it, and each count only includes its own event.
- A HubSpot event may relate to more than one company; each one is counted once per event.
- Anyone who can edit the table can change its counts, so keep it private to the team that reads it.
- If HubSpot's payload uses another name for the related company IDs, change it in the input schema and the filter in `workflow.ts` before publishing.
- To extend it: aggregate events into daily batches so each company updates once a day, or weight increments by type, so a click counts more than an open.
