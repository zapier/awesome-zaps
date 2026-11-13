# Create synonym entries from a document word list

When a new word-list document lands in your folder, each term is looked up for synonyms and saved to a shared table once, so the team has one up-to-date list.

**Apps:** Google Drive, Google Docs, Zapier Tables, Webhooks by Zapier

**Based on:** [Create synonym entries from document word list into cache](https://zapier.com/automations/data-analytics/data-integration/data-enrichment/create-synonym-entries-from-document-word-list-into-cache) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-synonym-entries-from-document-word-list-into-cache

The agent follows `SKILL.md`: it asks you for the word-list folder, the synonyms table and the thesaurus URL, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-docs`, `google-drive`)
- `triggers/`: what starts it
