---
name: populate-qa-backlog-items-with-randomized-test-content
description: Build a Zapier Next Gen Zap that seeds a Notion QA backlog item with a random test case from a Google Sheets content library, matched on the item's category, whenever the item's properties change. Use when a QA or engineering team tracks test work in a Notion database and keeps reusable test cases or test data in a sheet.
metadata:
  author: zapier
  summary: "When a QA backlog item in Notion gets or changes its category, a random matching test case from your spreadsheet is written into it, so testers start with a seeded case."
  apps: "Notion, Google Sheets"
  category: "Engineering"
  job: "Quality assurance"
  source: "https://zapier.com/automations/engineering/quality-assurance/test-data-management/populate-qa-backlog-items-with-randomized-test-content"
---

# Populate QA backlog items with randomized test content

## What it does

1. **Trigger:** one or more properties change on an item in a Notion data source (the QA backlog).
2. **Notion** reads the item and takes its category property. With no category, the run stops. If the seeded-content property already holds content seeded for that same category, the run stops too; that is how the workflow ignores its own write.
3. **Google Sheets** finds up to 500 rows whose category column matches.
4. The workflow picks one of those rows at random. With no matching rows, the run stops and writes nothing.
5. **Notion** replaces the item's seeded-content property with that row: a `[seeded for: <category>]` marker line, then one `Label: value` line per content column.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Notion, Updated Properties in Data Source Item (`notion`, `updated_data_source_item_properties`, built against `notion`). Its `authentication_id` is the user's Notion connection, and its one param is `datasource`: the QA backlog data source, picked from the field's choices (`get_trigger_field_choices`).
2. **Connections** (each alias in the code is the app's slug):
   - `notion`: the user's Notion connection, for the workspace that holds the backlog. The workflow calls Notion's API through it with `sdk.fetch` to read and write page properties. The backlog database must be shared with that integration.
   - `google-sheets`: the user's Google Sheets connection, for the account that owns the content sheet.
3. **Constants:**
   - `CATEGORY_PROPERTY`: the Notion property name that holds the category. Select, status, multi-select (first value), text and title properties all work.
   - `SEEDED_CONTENT_PROPERTY`: a **text** (rich text) property on the backlog, such as `Seeded Test Content`. The user adds it if it is missing; the run fails with a clear error if it is not there.
   - `SPREADSHEET_ID`: the long ID in the content sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `CATEGORY_COLUMN`: the column key (`COL$A` style, not the header name) holding each row's category.
   - `CONTENT_COLUMNS`: the column keys to copy, each with the label shown in Notion. Map the user's headers to their column letters.
   - `ROW_LIMIT`: rows read per lookup. Defaults to 500, the action's maximum.
4. Test with the steps below, then publish, and wait until the trigger is active.

## Ask the user

- Which Notion database is the QA backlog, and which property holds the category?
- Which text property should hold the seeded content? If none exists, ask them to add one (for example `Seeded Test Content`).
- Which sheet and tab is the content library, which column holds the category, and which columns should be copied into the page?
- Do the category values in Notion match the sheet's category column exactly? The lookup is an exact match.

## Test

Add a few rows to the content sheet first. The build used this layout:

| Category | Title                  | Steps                               | Expected Result                           |
| -------- | ---------------------- | ----------------------------------- | ----------------------------------------- |
| Login    | Wrong password lockout | Enter a wrong password 5 times      | Account locks and shows a reset link      |
| Login    | Unicode username       | Sign in as user 'zoë_测试'          | Login succeeds; name renders correctly    |
| Checkout | Zero-quantity cart     | Set the quantity to 0 and press Pay | Pay is disabled with a validation message |

Create a test item in the backlog named `[install-test] Seed check`, set its category to `Login`, and run a draft test run (`run_workflow_draft` in Zapier MCP) with that item's page ID:

```json
{ "id": "YOUR_NOTION_PAGE_ID" }
```

Check that:

- the item's seeded-content property now starts with `[seeded for: Login]` and holds one of the `Login` rows, never the `Checkout` one;
- a second run with the same input stops with `already-seeded-for-category` and changes nothing;
- after changing the category to `Checkout`, a run replaces the content with the `Checkout` row.

Archive the test item afterwards.

## Customize

- **Only seed pages in one status**, such as "Ready for QA": add a status check before the lookup.
- **Sequential instead of random selection**, for deterministic runs: replace the random pick with a fixed index (for example, the first row, or one based on the page ID).

## Notes

- The spec asks for a "created or updated" trigger. Notion offers those as two separate triggers, and a workflow has one. This uses the property-update trigger, which fires whenever the category is set or changed. A page created with its category already filled in may not fire it until the next property edit; swap to `new_data_source_item` if pages are created fully filled in (it then never reseeds on change).
- The workflow's own write changes a property, so the trigger fires again. The `[seeded for: <category>]` marker makes that second run a no-op. Don't remove the marker line.
- The content is written to a property, not the page body, so it can be replaced cleanly on each seed. Notion limits it to 2,000 characters; longer content is cut.
- If the content library has more than 500 rows for one category, only the first 500 are candidates.
- Never commit a real spreadsheet ID or Notion page ID.
