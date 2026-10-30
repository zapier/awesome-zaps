---
name: update-strategic-kr-when-tactical-kr-scope-changes
description: Build a Zapier Next Gen Zap that, when a tactical KR's watched properties change in Notion, finds its linked strategic KR and sets the strategic KR's scope-change checkbox. Use when leadership and ops keep strategic and tactical KRs in separate Notion databases and need a scope change on a tactical KR to flag the strategic KR automatically.
metadata:
  author: zapier
  summary: "When a tactical KR's scope changes, its linked strategic KR is flagged in Notion, so leadership and ops work from the same priorities."
  apps: "Notion"
  category: "Executives"
  job: "Strategy planning"
  source: "https://zapier.com/automations/executives/strategy-planning/okr-goal-tracking/update-strategic-kr-when-tactical-kr-scope-changes"
---

# Update strategic KR when tactical KR scope changes

## What it does

1. **Trigger:** a Notion data source item's properties are updated in the tactical KR database.
2. **Filter:** the run continues only if the tactical KR has a source reference and its status is "In progress".
3. **Notion** finds the strategic KR in the strategic database whose source reference matches. If there is none, the run stops and creates nothing.
4. **Filter:** if the strategic KR's scope-change checkbox is already true, the run stops.
5. **Notion** sets the strategic KR's scope-change checkbox to true.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Notion, Updated Properties in Data Source Item (`notion`, `updated_data_source_item_properties`), watching the tactical KR data source. It needs the user's Notion connection, so `authentication_id` is that connection's ID.
2. **Connections** (the alias in the code is the app's slug):
   - `notion`: the user's Notion connection, for the account that owns both KR databases. The database must be shared with that Notion integration.
3. **Constants:**
   - `TACTICAL_DATA_SOURCE_ID`: the data source ID of the tactical KR database.
   - `STRATEGIC_DATA_SOURCE_ID`: the data source ID of the strategic KR database.
   - `SOURCE_REFERENCE_PROPERTY`: the tactical KR property that links to its strategic KR. Use the same property name on both sides, or change the search step.
   - `STATUS_PROPERTY` and `IN_PROGRESS_STATUS`: the status property and the value that means "in progress".
   - `SCOPE_CHANGE_PROPERTY`: the strategic KR checkbox that flags a scope change.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the workflow to keep or disable.

## Ask the user

- Which Notion data sources are the tactical and strategic KR databases?
- Which property links a tactical KR to its strategic KR, and what is the status property's "in progress" value?
- Which strategic KR checkbox marks a scope change?
- Which tactical KR properties should trigger the update? The spec says "watched properties", but the trigger does not yet filter on specific properties.

## Test

The connected Notion account is personal and has no KR databases, so a test would change real data. To test, use a Notion test workspace or a test connection, with records named "[install-test] …", then run the sample below as a draft test run (`run_workflow_draft`):

```json
{
  "properties": {
    "Source reference": "[install-test] KR-001",
    "Status": "In progress",
    "Scope changed": true
  }
}
```

Check that the matching strategic record's scope-change checkbox is now true, and that no other strategic record changed. Then remove the test records.

## Customize

- **Notify the ops channel:** add a team notification step to post the update to your ops channel.
- **Audit comment:** append a comment on the strategic record that summarizes the change.

## Notes

- The workflow never creates a strategic record. A tactical KR with no matching strategic KR is skipped.
- The spec's "map source fields to strategic fields" is reduced to the one scope-change flag. The spec defines no other field to map.
- Property names in the source are placeholders, so the draft cannot run until they are filled in.
