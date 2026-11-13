---
name: update-strategic-plan-records-from-daily-okr-snapshot
description: Build a Zap on Zapier that refreshes each Strategic Plan record in Salesforce every day from the OKR goal list, so roadmap owners see current progress without manual edits. It matches each goal to its record by external OKR ID, updates it, and creates it when no match exists. Use when an executive or strategy team keeps OKR goals in an external system and wants those records refreshed every day.
license: MIT
metadata:
  author: zapier
  summary: "Every morning, each OKR goal is copied into its Strategic Plan record in Salesforce, so roadmap owners always see current progress."
  apps: "Schedule by Zapier, Webhooks by Zapier, Salesforce"
  category: "Executives"
  job: "Strategy planning"
  source: "https://zapier.com/automations/executives/strategy-planning/okr-goal-tracking/update-strategic-plan-records-from-daily-okr-snapshot"
---

# Update strategic plan records from daily OKR snapshot

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-strategic-plan-records-from-daily-okr-snapshot. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** every day at 12:00 AM, from Schedule by Zapier (`schedule`, `everyDay`).
2. **Webhooks by Zapier** GETs the OKR endpoint and reads the goal list (JSON array). Each goal has an external `id`, `title`, `due_date`, `status`, `percent_complete` and `type`.
3. For each goal, **Salesforce** searches Strategic Plan records for the one whose external OKR ID matches.
4. If a record matches, **Salesforce** updates it: title to name, due date to end date, status to the status picklist, percent to percent complete, type to initiative type.
5. If none matches, **Salesforce** creates the record with the same fields, the external ID and the configured fiscal year.
6. A failed goal is counted and skipped; the rest still run. The run returns `{ goals, created, updated, failed }`.

The OKR endpoint is treated as the source of truth: each run overwrites the matched record's name, end date, status, percent and initiative type, and the Zap never deletes a record.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                    | What goes there                                                             |
| -------------------------- | --------------------------------------------------------------------------- |
| `REPLACE_OKR_ENDPOINT_URL` | The URL of the OKR endpoint that returns the goal list as a bare JSON array |

Defaults worth reviewing with them, all in `config.ts` or `workflow.ts`. These are guesses until checked against their Salesforce org:

- `STRATEGIC_PLAN_OBJECT` (`Strategic_Plan__c`): the Salesforce API name of the Strategic Plan object.
- `EXTERNAL_ID_FIELD` (`External_OKR_ID__c`): the field that holds the external OKR ID.
- `FISCAL_YEAR` (`FY26`): the fiscal year written to new records.
- `FIELDS` in `workflow.ts`: the Salesforce field API names for name, end date, status, percent complete, initiative type and fiscal year.
- The timezone of the daily run: the trigger uses the account timezone, which defaults to UTC.

Confirm the endpoint returns a bare JSON array before building.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `salesforce` (the account that owns the Strategic Plan records; use a sandbox or integration account if one exists) to the user's Salesforce connection. Schedule by Zapier and Webhooks by Zapier need no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/every-day.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match. The Salesforce field names in `FIELDS` are the most likely to need fixing.

## Test it

Run it once as a draft test with a sample goal list that has one goal already in the sandbox and one that is not, for example:

```json
[
  {
    "id": "OKR-101",
    "title": "[install-test] Ship connectors v2",
    "due_date": "2026-12-31",
    "status": "On track",
    "percent_complete": 40,
    "type": "Initiative"
  },
  {
    "id": "OKR-102",
    "title": "[install-test] Reduce onboarding time",
    "due_date": "2026-09-30",
    "status": "At risk",
    "percent_complete": 15,
    "type": "Key result"
  }
]
```

Check that OKR-101's record has its percent and status updated, that OKR-102 is created with the external ID and fiscal year, and that the run returns `created: 1, updated: 1, failed: 0`. If run-status tools aren't available, check the result in Salesforce directly. Then publish, confirm the trigger is active, and ask the user to delete the test records. The agent doesn't delete test data.

## Notes

- The Salesforce create and update actions take their fields as dynamic properties, so the first test run is what confirms the field names in `workflow.ts`.
- The shape of the Webhooks GET output (`content`) is assumed, not observed.
- Failures are only visible in the run output. There is no notification step yet. To notify on new or completed goals, add a Slack or email step after the create and update steps. To update only on change, skip the update when percent and status already match the record.
- Never commit a real endpoint URL or record IDs. The OKR endpoint may expose company goal data.
