---
name: update-strategic-kr-when-tactical-kr-scope-changes
description: Build a Zap on Zapier that, when a tactical KR's watched properties change in Notion, finds its linked strategic KR and sets the strategic KR's scope-change checkbox. Use when leadership and ops keep strategic and tactical KRs in separate Notion databases and need a scope change on a tactical KR to flag the strategic KR automatically.
license: MIT
metadata:
  author: zapier
  summary: "When a tactical KR's scope changes, its linked strategic KR is flagged in Notion, so leadership and ops work from the same priorities."
  apps: "Notion"
  category: "Executives"
  job: "Strategy planning"
  source: "https://zapier.com/automations/executives/strategy-planning/okr-goal-tracking/update-strategic-kr-when-tactical-kr-scope-changes"
---

# Update strategic KR when tactical KR scope changes

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-strategic-kr-when-tactical-kr-scope-changes. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Notion data source item's properties are updated in the tactical KR database (`notion`, `updated_data_source_item_properties`).
2. **Filter:** the run continues only if the tactical KR has a source reference and its status is "In progress".
3. **Notion** finds the strategic KR in the strategic database whose source reference matches. If there is none, the run stops and creates nothing.
4. **Filter:** if the strategic KR's scope-change checkbox is already true, the run stops.
5. **Notion** sets the strategic KR's scope-change checkbox to true.

The Zap never creates a strategic KR, and a tactical KR with no matching strategic KR is skipped.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                             | What goes there                                                                                                                     |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_TACTICAL_DATA_SOURCE_ID`   | The data source of the Tactical KRs database, the one the trigger watches                                                           |
| `REPLACE_STRATEGIC_DATA_SOURCE_ID`  | The data source of the Strategic KRs database                                                                                       |
| `REPLACE_SOURCE_REFERENCE_PROPERTY` | The tactical KR property that links it to its strategic KR. Use the same property name on both databases, or change the search step |
| `REPLACE_STATUS_PROPERTY`           | The tactical KR status property                                                                                                     |
| `REPLACE_SCOPE_CHANGE_PROPERTY`     | The strategic KR checkbox that flags a scope change                                                                                 |

Also review the default with them: `IN_PROGRESS_STATUS` (`"In progress"`), the status value that counts as in progress. Change it if their database uses another name.

Also ask: which tactical KR properties should trigger the update? The trigger does not filter by property yet, so a change to any property runs the workflow.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `notion` to the user's Notion connection, for the account that owns both KR databases. Both databases must be shared with that Notion integration. No other apps need a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-data-source-item-properties.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and point the trigger at the data source in `TACTICAL_DATA_SOURCE_ID`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's Notion connection and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Use a Notion test workspace or a test connection, with records named "[install-test] …". Never run this against the user's real KR databases, since the test changes a record. Run it once as a draft test run, with the sample below, using the names of their own properties as keys:

```json
{
  "properties": {
    "Source reference": "[install-test] KR-001",
    "Status": "In progress",
    "Scope changed": true
  }
}
```

Check that the matching strategic record's scope-change checkbox is now true, and that no other strategic record changed. If run-status tools aren't available, check the strategic record in Notion directly. Then publish, confirm the trigger is active, and leave the workflow for the user to keep or disable. The user deletes the test records, not the agent.

## Notes

- Until every `REPLACE_…` value is filled in, the workflow cannot run.
- The spec's "map source fields to strategic fields" is reduced to the one scope-change flag. The spec defines no other field to map.
- To extend it: post the update to an ops channel after the last step, or append an audit comment on the strategic record that summarizes the change.
