---
name: update-strategic-plan-records-from-daily-okr-snapshot
description: Use when an executive or strategy team keeps OKR goals in an external system and wants the Strategic Plan records in Salesforce refreshed every day, so roadmap owners see current progress without manual edits. Matches each goal to its record by external OKR ID, updates it, and creates it when no match exists.
metadata:
  author: zapier
  summary: "Every morning, each OKR goal is copied into its Strategic Plan record in Salesforce, so roadmap owners always see current progress."
  apps: "Schedule by Zapier, Webhooks by Zapier, Salesforce"
  category: "Executives"
  job: "Strategy planning"
  source: "https://zapier.com/automations/executives/strategy-planning/okr-goal-tracking/update-strategic-plan-records-from-daily-okr-snapshot"
---

# Update strategic plan records from daily OKR snapshot

## What it does

1. **Trigger:** every day at 12:00 AM, from Schedule by Zapier.
2. **Webhooks by Zapier** GETs the OKR endpoint and reads the goal list (JSON array). Each goal has an external `id`, `title`, `due_date`, `status`, `percent_complete` and `type`.
3. For each goal, **Salesforce** searches Strategic Plan records for the one whose external OKR ID matches.
4. If a record matches, **Salesforce** updates it: title to name, due date to end date, status to the status picklist, percent to percent complete, type to initiative type. The source is treated as authoritative.
5. If none matches, **Salesforce** creates the record with the same fields, the external ID and the configured fiscal year.
6. A failed goal is counted and skipped; the rest still run. The run returns `{ goals, created, updated, failed }`.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill and follow it to create, test and publish the workflow.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top.

1. **Trigger:** Schedule by Zapier, `everyDay` (`schedule`), `hod: "12:00 AM"`, `weekends: "yes"`. No connection.
2. **Connections** (each alias is the app's slug):
   - `salesforce`: a Salesforce connection for the account that owns the Strategic Plan records. Use a sandbox or integration account if one exists.
   - Webhooks by Zapier needs no connection.
3. **Constants:**
   - `OKR_ENDPOINT_URL`: the URL that returns the goal JSON.
   - `STRATEGIC_PLAN_OBJECT`: the Salesforce API name of the Strategic Plan object.
   - `EXTERNAL_ID_FIELD`: the field that holds the external OKR ID.
   - `FISCAL_YEAR`: the fiscal year value written on create.
   - `FIELDS`: the Salesforce field API names for name, end date, status, percent complete, initiative type and fiscal year.

## Ask the user

Confirm them before deploying:

- What is the OKR endpoint URL, and does it return a bare JSON array?
- What are the Salesforce object and field API names? The defaults (`Strategic_Plan__c`, `External_OKR_ID__c`, and so on) are guesses.
- Which fiscal year should new records get? The default is `FY26`.
- Which timezone should the daily run use? The trigger uses the account timezone, which defaults to UTC.

## Test

To test, use a sample goal list with one goal that exists in the sandbox and one that does not, for example:

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

Check that OKR-101's record has its percent and status updated, that OKR-102 is created with the external ID and fiscal year, and that the run returns `created: 1, updated: 1, failed: 0`.

## Customize

- **Only update on change:** skip the update when percent and status match the record.
- **Notify on new or completed goals:** add a Slack or email step after the create and update steps.

## Notes

- The Salesforce create and update actions take their fields as dynamic properties. The field names above are not yet checked against a real object, so the first test run is what confirms them.
- The output shape of the Webhooks GET step (`content`) is assumed, not observed.
- Failures are only visible in the run output. There is no notification step yet.
- Never commit a real endpoint URL or spreadsheet/record IDs. The OKR endpoint may expose company goal data.
