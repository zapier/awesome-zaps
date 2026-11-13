---
name: create-synonym-entries-from-document-word-list-into-cache
description: Build a Zap on Zapier that reads a new word-list document from a Google Drive folder, looks up synonyms for each term in a thesaurus, and writes one entry per new term into a Zapier Table. Use when a content or SEO team keeps a word list in Google Docs and wants a shared, de-duplicated table of terms and synonyms without copying by hand.
license: MIT
metadata:
  author: zapier
  summary: "When a new word-list document lands in your folder, each term is looked up for synonyms and saved to a shared table once, so the team has one up-to-date list."
  apps: "Google Drive, Google Docs, Zapier Tables, Webhooks by Zapier"
  category: "Data & Analytics"
  job: "Data integration"
  source: "https://zapier.com/automations/data-analytics/data-integration/data-enrichment/create-synonym-entries-from-document-word-list-into-cache"
---

# Create synonym entries from a document word list

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-synonym-entries-from-document-word-list-into-cache. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new file is added to the watched Google Drive folder (`google-drive`, `file_in_folder_v2`).
2. **Google Docs** reads the document's text.
3. Plain code splits the text into one term per line, lowercased and de-duplicated, capped at 50 terms.
4. For each term, in turn:
   - **Zapier Tables** looks for an existing record with the same term. If one exists, the term is skipped.
   - Otherwise **Webhooks by Zapier** (GET) queries the thesaurus with the term as `word`, and the synonyms are joined into one string.
   - **Zapier Tables** creates a record with the term and its synonyms.
5. The run returns counts of created, existing and failed terms. One failed term does not stop the others.

The Zap only adds records. It never edits or deletes an existing entry.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                     | What goes there                                                                                                       | Where                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `REPLACE_WATCHED_FOLDER_ID` | The Google Drive folder that receives the word-list documents                                                         | `config.ts`, and `folder` in `triggers/file-in-folder.ts` |
| `REPLACE_TABLE_ID`          | The Zapier Table that holds the synonym entries                                                                       | `config.ts`                                               |
| `REPLACE_TERM_COLUMN`       | The table column that stores the term; existing entries are matched on it                                             | `config.ts`                                               |
| `REPLACE_SYNONYMS_COLUMN`   | The table column that stores the synonyms, joined into one string                                                     | `config.ts`                                               |
| `REPLACE_THESAURUS_URL`     | The thesaurus API URL. Each term is sent as the `word` query parameter, and `json.synonyms` is read from the response | `config.ts`                                               |

Also review the defaults with them: `SYNONYM_SEPARATOR` in `config.ts` (`", "`, between synonyms in the cell) and `MAX_WORDS` in `workflow.ts` (50 terms per document).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-docs` (the account that owns the word-list documents) and `google-drive` (the account that owns the watched folder) to the user's connections. Webhooks by Zapier and Zapier Tables take no connection alias, so there is nothing to bind for them.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/file-in-folder.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match. The synonyms column key comes from the table's fields.

## Test it

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a Google Doc that holds the word list, with a few lines and at least one term that already exists in the table:

```json
{
  "id": "TEST_DOCUMENT_ID",
  "name": "[install-test] synonym word list"
}
```

Check that:

- The table gained one record per new term, with the term in `TERM_COLUMN` and its synonyms joined in `SYNONYMS_COLUMN`.
- Terms that already had a record were skipped, and no duplicate was created.
- The returned counts match the document: `created + existing + failed = total`.

If run-status tools aren't available, check the result in Zapier Tables directly. Ask the user to delete the test records; the agent doesn't delete them.

Then publish, confirm the trigger is active, and tell the user which folder it watches.

## Notes

- Matching is exact and lowercase. "Run" and "running" are different terms.
- A term with no synonyms still creates a record, with an empty synonyms cell.
- Anyone who can edit the table can change the synonyms, so keep the table shared only with the content team.
- To extend it: use an internal synonym list instead of the external API, add tagging or language fields to records, or add an email step after the create step to alert owners of new entries.
- Never commit a real folder ID, table ID, thesaurus key or webhook URL.
