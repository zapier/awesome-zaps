---
name: create-a-b-test-entry-in-your-experiment-database
description: Build a Zapier Next Gen Zap that creates an experiment entry in a Notion database when an Asana task moves into your A/B testing section, carrying the task's name, link, description and owner. Use when a product or growth team tracks A/B tests as Asana tasks and wants each one to have a ready-to-use record in its experiment database for reporting and handoff.
metadata:
  author: zapier
  summary: "When a task reaches your A/B testing section in Asana, a matching entry is created in your Notion experiment database, so every test has a record without manual copying."
  apps: "Asana, Notion"
  category: "Product"
  job: "Product experimentation"
  source: "https://zapier.com/automations/product/product-experimentation/feature-experiment-tracking/create-a-b-test-entry-in-your-experiment-database"
---

# Create an A/B test entry in your experiment database

## What it does

1. **Trigger:** a task is moved to a section in an Asana project (Asana's Task Moved to Section trigger, set to your A/B testing section).
2. **Notion** creates one item in your experiment database. The item's body holds the task name as a heading, the task link, the owner (the assignee's name, or "Unassigned") and the task description.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**Check the fields first:** with your own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first run. Notion's fields depend on your data source, so check its property names too.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Asana, Task Moved to Section (`asana`, action `task_moved_to_section`). Set its `workspace`, `project` and `section_id` to your A/B testing section. Pick the section from the dropdowns, not by typing a name.
2. **Connections** (each alias in the code is the app's slug):
   - `asana`: the Asana account that owns the project. It is also the trigger's connection.
   - `notion`: the Notion account whose workspace has the experiment database, with the database shared to that integration.
3. **Constants:**
   - `EXPERIMENT_DATA_SOURCE`: the ID of the Notion data source (experiment database) that new entries go into.
   - `CONTENT_FORMAT`: leave as `"markdown"`.

## Ask the user

- Which Asana workspace, project and section mean "A/B testing"?
- Which Notion database is the experiment database? Is it shared with the Notion connection being used?
- Should each entry also set the database's title, task-link and status properties? Map them to the property names in that database.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, with a task you created for the test:

```json
{
  "gid": "1200000000000001",
  "name": "[install-test] Checkout button copy test",
  "notes": "Compare 'Start free trial' against 'Try Zapier free' on the pricing page.",
  "permalink_url": "https://app.asana.com/0/0/1200000000000001",
  "assignee": { "name": "Test Person" }
}
```

Confirm that one new Notion entry appeared with the task name as its heading, the link, the owner line and the description. Then delete the test entry and the test task.

## Customize

- **Update instead of create:** when an entry already exists with the same task link, update it instead of creating a new one.
- **Tags or owner from the task:** fill the database's tag or owner fields from the task's custom fields or assignee.

## Notes

- The entry's body carries the task details. Map them to the database's own properties (title, task link, status) by adding those fields to the Notion action once you know the property names.
- Each run creates one entry per task that moves into the section. A task moved in and out of the section creates a new entry each time it moves in.
- Anyone who can post to this Zap's trigger can create entries in your database. Keep the Asana section limited to the people who should create them.
