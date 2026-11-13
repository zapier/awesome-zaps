---
name: create-a-b-test-entry-in-your-experiment-database
description: Build a Zap on Zapier that creates an experiment entry in a Notion database when an Asana task moves into your A/B testing section, carrying the task's name, link, description and owner. Use when a product or growth team tracks A/B tests as Asana tasks and wants each one to have a ready-to-use record in its experiment database for reporting and handoff.
license: MIT
metadata:
  author: zapier
  summary: "When a task reaches your A/B testing section in Asana, a matching entry is created in your Notion experiment database, so every test has a record without manual copying."
  apps: "Asana, Notion"
  category: "Product"
  job: "Product experimentation"
  source: "https://zapier.com/automations/product/product-experimentation/feature-experiment-tracking/create-a-b-test-entry-in-your-experiment-database"
---

# Create an A/B test entry in your experiment database

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-a-b-test-entry-in-your-experiment-database. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a task is moved to a section in an Asana project (`asana`, `task_moved_to_section`), set to your A/B testing section.
2. **Notion** creates one item in your experiment database (`notion`, `create_database_item`). The item's body holds the task name as a heading, the task link, the owner (the assignee's name, or "Unassigned") and the task description.

The Zap only creates entries. It doesn't change the task or any existing entry.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | What goes there                                                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `EXPERIMENT_DATA_SOURCE` | The Notion database that new entries go into. Ask which database it is, then look up its data source ID with the user's Notion connection |

Also ask which Asana workspace, project and section mean "A/B testing", and set the trigger's `workspace`, `project` and `section_id` to them from the dropdowns. The trigger has no `REPLACE_` value, so this is a question, not a lookup.

Review the default with them: `CONTENT_FORMAT` is `"markdown"`, which renders the heading and link. Leave it unless they need another format.

Before turning it on, confirm the Notion database is shared with the Notion integration being used, and ask whether each entry should also set the database's title, task-link and status properties. If so, map them to that database's property names.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `notion` to the user's Notion connection for the workspace with the experiment database, and bind `asana` to the Asana connection for the project (the trigger uses it too). Both apps need a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with `EXPERIMENT_DATA_SOURCE` replaced by the user's answer. `triggers/task-moved-to-section.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's `workspace`, `project` and `section_id` to the user's A/B testing section. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug (`asana`), find the row whose `key` is the trigger's `event` (`task_moved_to_section`), and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match. Check Notion's property names too, since they depend on the database.

## Test it

Run this sample as a draft test (`run_workflow_draft` in Zapier MCP) before publishing:

```json
{
  "gid": "1200000000000001",
  "name": "[install-test] Checkout button copy test",
  "notes": "Compare 'Start free trial' against 'Try Zapier free' on the pricing page.",
  "permalink_url": "https://app.asana.com/0/0/1200000000000001",
  "assignee": { "name": "Test Person" }
}
```

Check that one new Notion entry appeared with the task name as its heading, the link, the owner line and the description. If run-status tools aren't available, check the result in Notion directly. Ask the user to delete the test entry and the test task; the agent doesn't delete test data.

## Notes

- The entry's body carries the task details. To fill the database's own properties (title, task link, status), add those fields to the Notion step once you know their names.
- Each task moved into the section creates one entry, so a task moved in and out again creates another.
- Anyone who can move tasks into that section can create entries in your database. Keep the section limited to the people who should.
- To update an existing entry with the same task link instead of creating a new one, or to fill a tag or owner field from the task's custom fields or assignee, change the Notion step.
