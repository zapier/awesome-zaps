---
name: create-synonym-entries-from-document-word-list-into-cache
description: Build a Zapier Next Gen Zap that reads a new word-list document from a Google Drive folder, looks up synonyms for each term in a thesaurus, and writes one entry per new term into a Zapier Table. Use when a content or SEO team keeps a word list in Google Docs and wants a shared, de-duplicated table of terms and synonyms without copying by hand.
metadata:
  author: zapier
  summary: "When a new word-list document lands in your folder, each term is looked up for synonyms and saved to a shared table once, so the team has one up-to-date list."
  apps: "Google Drive, Google Docs, Zapier Tables, Webhooks by Zapier"
  category: "Data & Analytics"
  job: "Data integration"
  source: "https://zapier.com/automations/data-analytics/data-integration/data-enrichment/create-synonym-entries-from-document-word-list-into-cache"
---

# Create synonym entries from a document word list

## What it does

1. **Trigger:** a new file is added to the watched Google Drive folder.
2. **Google Docs** reads the document's text.
3. Plain code splits the text into one term per line, lowercased and de-duplicated, capped at `MAX_WORDS` (50).
4. For each term, in turn:
   - **Zapier Tables** looks for an existing record with the same term. If one exists, the term is skipped.
   - Otherwise **Webhooks by Zapier** (GET) queries the thesaurus with the term as `word`, and the synonyms are joined into one string.
   - **Zapier Tables** creates a record with the term and its synonyms.
5. The run returns counts of created, existing and failed terms. One failed term does not stop the others.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Drive, New File in Folder (`google-drive`, `file_in_folder_v2`). It needs a Google Drive connection, so its `authentication_id` is that connection's ID.
2. **Connections** (each alias in the code is the app's slug):
   - `google-docs`: the Google Docs connection for the account that owns the word-list documents.
   - `zapier-tables`: the Zapier Tables connection, for the account that owns the synonym table.
   - `webhook`: none. It is a no-auth app.
3. **Constants:**
   - `WATCHED_FOLDER_ID`: the Drive folder's ID from its URL.
   - `TABLE_ID`: the Zapier Table's ID.
   - `TERM_COLUMN`, `SYNONYMS_COLUMN`: the table's column keys for the term and the synonyms. Read them from the table's fields once it is connected.
   - `THESAURUS_URL`: your thesaurus endpoint. The code sends the term as the `word` query parameter and reads `json.synonyms` from the JSON response; change that if your API returns a different shape.
   - `MAX_WORDS`: the most terms processed per document. Defaults to `50`.
   - `SYNONYM_SEPARATOR`: what goes between synonyms in the cell. Defaults to `", "`.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user the folder the trigger watches.

## Ask the user

- Which Drive folder receives the word-list documents?
- Which Zapier Table holds the synonyms, and what are its term and synonyms column keys?
- Which thesaurus API should be queried, and what does its response look like?
- Should a new entry also send a notification email to the owner? (The original recipe marks this optional. It is left out here.)

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a Google Doc that holds the word list, with a few lines and at least one term that already exists in the table:

```json
{
  "id": "YOUR_TEST_DOCUMENT_ID",
  "name": "[install-test] synonym word list"
}
```

Check that:

- The table gained one record per new term, with the term in `TERM_COLUMN` and its synonyms joined in `SYNONYMS_COLUMN`.
- Terms that already had a record were skipped, and no duplicate was created.
- The returned counts match the document: `created + existing + failed = total`.

Then delete the test records if they were created for testing.

The draft has no working Drive or Zapier Tables connection, and the constants are placeholders.

## Customize

- **Offline synonym list:** use an internal synonym list instead of the external API, so the Zap works offline.
- **Language and tagging:** add tagging or language fields to records for regional keyword variants.
- **Team notification:** add an email step after the create step to alert owners of new entries.

## Notes

- Matching is exact and lowercase. "Run" and "running" are different terms.
- A term with no synonyms still creates a record, with an empty synonyms cell.
- Anyone who can edit the table can change the synonyms, so keep the table shared only with the content team.
- Never commit a real folder ID, table ID, thesaurus key or webhook URL.
