---
name: populate-qa-backlog-items-with-randomized-test-content
description: Build a Zap on Zapier that seeds a Notion QA backlog item with a random test case from a Google Sheets content library, matched on the item's category, whenever the item's properties change. Use when a QA or engineering team tracks test work in a Notion database and keeps reusable test cases or test data in a sheet.
license: MIT
metadata:
  author: zapier
  summary: "When a QA backlog item in Notion gets or changes its category, a random matching test case from your spreadsheet is written into it, so testers start with a seeded case."
  apps: "Notion, Google Sheets"
  category: "Engineering"
  job: "Quality assurance"
  source: "https://zapier.com/automations/engineering/quality-assurance/test-data-management/populate-qa-backlog-items-with-randomized-test-content"
---

# Populate QA backlog items with randomized test content

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/populate-qa-backlog-items-with-randomized-test-content. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** one or more properties change on an item in the QA backlog Notion data source (`notion`, `updated_data_source_item_properties`).
2. **Notion** reads the item and takes its category property. With no category, the run stops. If the seeded-content property already holds content seeded for that same category, the run stops too, so the Zap's own write doesn't reseed the item.
3. **Google Sheets** finds up to 500 rows whose category column matches.
4. The Zap picks one of those rows at random. With no matching rows, the run stops and writes nothing.
5. **Notion** replaces the item's seeded-content property with that row: a `[seeded for: <category>]` marker line, then one `Label: value` line per content column.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | Where                                                           | What goes there                                                                                    |
| ------------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `SPREADSHEET_ID`         | `config.ts`                                                     | The test-content sheet: the library of test cases, looked up from the user's Google Sheets account |
| `REPLACE_DATA_SOURCE_ID` | `triggers/updated-data-source-item-properties.ts`, `datasource` | The QA backlog Notion database's data source, looked up with the user's Notion connection          |

Also review the defaults with them: `CATEGORY_PROPERTY` (`Category`, the Notion property that holds the category), `SEEDED_CONTENT_PROPERTY` (`Seeded Test Content`, a text property on the backlog), `WORKSHEET_ID` (`"0"` is the first tab), `CATEGORY_COLUMN` (the column holding each row's category, such as `COL$A`), and the `CONTENT_COLUMNS` map in `workflow.ts`, where each column key is paired with the label shown in Notion. Map the user's sheet headers to their column letters.

Before turning it on, confirm:

- The category values in Notion match the sheet's category column exactly. The lookup is an exact match.
- The seeded-content property exists on the backlog as a text (rich text) property. If it's missing, the user adds it; the run fails with a clear error until they do.
- The backlog database is shared with the Notion integration the `notion` connection uses.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `notion` to the user's Notion connection for the workspace that holds the backlog, and `google-sheets` to the user's Google Sheets connection for the account that owns the content sheet. The workflow calls Notion's API through `notion` to read and write page properties.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-data-source-item-properties.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Add a few rows to the content sheet first. The build used this layout:

| Category | Title                  | Steps                               | Expected Result                           |
| -------- | ---------------------- | ----------------------------------- | ----------------------------------------- |
| Login    | Wrong password lockout | Enter a wrong password 5 times      | Account locks and shows a reset link      |
| Login    | Unicode username       | Sign in as user 'zoë_测试'          | Login succeeds; name renders correctly    |
| Checkout | Zero-quantity cart     | Set the quantity to 0 and press Pay | Pay is disabled with a validation message |

Create a test item in the backlog named `[install-test] Seed check`, set its category to `Login`, and run it once as a draft test (`run_workflow_draft`) with that item's page ID:

```json
{ "id": "<page ID of the test item>" }
```

Check that:

- the item's seeded-content property now starts with `[seeded for: Login]` and holds one of the `Login` rows, never the `Checkout` one;
- a second run with the same input stops with `already-seeded-for-category` and changes nothing;
- after changing the category to `Checkout`, a run replaces the content with the `Checkout` row.

If run-status tools aren't available, check the result in Notion directly. Ask the user to archive the test item and remove the sample rows afterwards; the agent doesn't delete test data.

## Notes

- The spec asks for a "created or updated" trigger. Notion offers those as two separate triggers, and a workflow has one. This uses the property-update trigger, which fires whenever the category is set or changed. A page created with its category already filled in may not fire it until the next property edit; swap to `new_data_source_item` if pages are created fully filled in (it then never reseeds on change).
- Don't remove the `[seeded for: <category>]` marker line. The write changes a property, so the trigger fires again, and the marker makes that second run a no-op.
- The content goes in a property, not the page body, so it can be replaced cleanly on each seed. Notion caps it at 2,000 characters; longer content is cut.
- Only the first 500 rows for one category are candidates.
- To seed only pages in one status (such as "Ready for QA"), add a status check before the lookup. For deterministic runs instead of random ones, replace the random pick with a fixed index.
