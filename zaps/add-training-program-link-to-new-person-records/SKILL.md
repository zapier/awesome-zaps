---
name: add-training-program-link-to-new-person-records
description: Build a Zap on Zapier that, when a new Pipedrive person has a training or program reference, looks up the matching program in a Zapier Table and writes its link back to the person's record. Use when an HR or Talent Ops team keeps training programs in a Zapier Table and wants each new hire's Pipedrive record to get the right program link automatically.
license: MIT
metadata:
  author: zapier
  summary: "When a new person is added to Pipedrive with a training reference, the matching program link from your training table is copied onto their record, so no one has to look it up by hand."
  apps: "Pipedrive, Zapier Tables"
  category: "Human Resources (HR)"
  job: "Learning development"
  source: "https://zapier.com/automations/human-resources-hr/learning-development/training-assignment/add-training-program-link-to-new-person-records"
---

# Add training program link to new person records

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/add-training-program-link-to-new-person-records. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new person in Pipedrive (`pipedrive`, `personV2`) fires when a person record is created.
2. **Stop early** if the person has no training reference in the configured custom field.
3. **Zapier Tables** (`zapier-tables`) finds the row whose program key matches that reference exactly. If there is no match, the run stops and nothing is written. No table rows are created.
4. **Pipedrive** updates that same person with the program link from the matched row, in the configured link field. No new person is created.

The Zap never creates a table row or a person, and it changes nothing when the reference or the match is missing.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                         | What goes there                                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `REPLACE_TRAINING_TABLE_ID`     | The Zapier Table that holds the training programs. Look up its ID with the user's Zapier Tables connection.                    |
| `REPLACE_PERSON_TRAINING_FIELD` | The Pipedrive custom field that holds the training or program reference. Look up its key with the user's Pipedrive connection. |
| `REPLACE_PERSON_LINK_FIELD`     | The Pipedrive custom field that receives the program link. Look up its key with the user's Pipedrive connection.               |

Also review the defaults with them: `PROGRAM_KEY_FIELD` (`f1`) and `PROGRAM_LINK_FIELD` (`f2`) are the table's columns for the program key to match and the program link to copy. Check them against the table's output schema.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `pipedrive` (the account whose people are being updated) and `zapier-tables` (the account that owns the training table) to the user's connections. The trigger and the action use the same Pipedrive connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/person-v2.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with a test person whose training field holds a key that exists in the table:

```json
{
  "id": 4100001,
  "<training field key>": "[install-test] PROG-100"
}
```

Check that the table lookup returns the row, and that the person's link field now holds that row's program link. Then run it again with a key that isn't in the table, and check that the person is skipped and nothing is written. If run-status tools aren't available, check Pipedrive and the table directly. Ask the user to delete the test person and table row; the agent doesn't delete them. Then publish, confirm the trigger is active, and do the real thing once with a new test person.

## Notes

- Table matching is exact. If the table has more than one row with the same key, the lookup uses the most recently created one.
- A missing reference or a missing match skips the run quietly. To hear about these, add a Slack or email step after the `no-matching-program` return in `workflow.ts`.
- To normalize lookup values (trim, change case) before the table search, add a plain JavaScript step before `find-training-program`.
