# Create contract send records with signer contact details

When a Dropbox Sign signature request is sent, each signer gets a row in your Zapier Table with their name, email, sent time and request ID, so every contract you send is on record.

**Apps:** Dropbox Sign, Zapier Tables

**Based on:** [Create contract, send, records with signer contact details](https://zapier.com/automations/legal/contract-management/contract-documentation-management/create-contract-send-records-with-signer-contact-details) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-contract-send-records-with-signer-contact-details

The agent follows `SKILL.md`: it asks you which table holds the signer records and which Dropbox Sign account sends the requests, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`dropbox-sign`, `zapier-tables`)
- `triggers/`: what starts it
