---
name: create-tailored-sales-decks-from-incoming-request-webhook
description: Build a Zap on Zapier that turns an incoming sales request into a branded Google Slides deck, filled from the request and the matching account record in Zapier Tables. Use when a sales team wants a tailored proposal or pitch deck generated automatically from a form, CRM or script submission, with duplicate requests skipped.
license: MIT
metadata:
  author: zapier
  summary: "When a sales request comes in, a tailored deck is built from a template with the client's details and saved for the deal team, and repeat requests are skipped."
  apps: "Webhooks by Zapier, Storage by Zapier, Zapier Tables, Google Slides"
  category: "Sales"
  job: "Sales enablement"
  source: "https://zapier.com/automations/sales/sales-enablement/sales-content-management/create-tailored-sales-decks-from-incoming-request-webhook"
---

# Create tailored sales decks from incoming request webhook

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-tailored-sales-decks-from-incoming-request-webhook. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a sales request arrives at a `webhook` catch hook (a form, CRM or script posts to it). The request ID, from `submission_id` or the URL's `id`, is the dedupe key.
2. **`storage`** checks for a key built from the request ID. If the key already exists, the run stops and no second deck is made.
3. **`zapier-tables`** looks up the account or opportunity record whose request-ID column matches. If none matches, it creates a new record with the client name and a status.
4. **Plain text cleanup** (no app step) trims the agenda, pricing summary and next steps, and title-cases the client name. The deck title defaults to the client name and the run date.
5. **`google-slides`** copies the template and fills its placeholders with the title, client name, agenda, pricing summary and next steps.
6. **`storage`** saves the request key with the new deck's ID, so a later repeat of the same request is skipped.

A repeated request ID stops at step 2, so it never makes a second deck.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                    | What goes there                                                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `TEMPLATE_PRESENTATION_ID` | The Google Slides template every deck is copied from: ask which deck, then look up its ID with `google-slides`                    |
| `TABLE_ID`                 | The Zapier Tables table that holds the account and opportunity records: ask which table, then look up its ID with `zapier-tables` |

Also review the defaults with them, in `config.ts`:

- `REQUEST_ID_FIELD`, `CLIENT_NAME_FIELD`, `STATUS_FIELD`: column keys such as `new__data__f2`, not column names. Map them to the table's columns.
- `NEW_RECORD_STATUS`: the status written to a new record (`"Deck requested"`).
- `SHARE_DECK_WITH_LINK`: `false` keeps each deck private to the connected Google account. Ask whether decks should be shared with anyone who has the link, and set it to `true` only if they should.

Prerequisites to confirm:

- The template's placeholder names must match the fields the workflow fills: `client_name`, `agenda`, `pricing_summary` and `next_steps`, for example `{{client_name}}`. The action's fields are generated from the template, so match them after connecting `google-slides`.
- The request sender must post `submission_id` (or `id`), `client_name`, `presentation_title`, `agenda`, `pricing_summary` and `next_steps`. If it uses other names, change those keys in the input schema before installing.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `storage` (the user's Storage by Zapier connection), `zapier-tables` (the connection for the table that holds the account and opportunity records) and `google-slides` (the account that owns the template and will own the decks) to the user's connections. Webhooks by Zapier (`webhook`) needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP), with a request ID that has no matching key in Storage by Zapier:

```json
{
  "submission_id": "REQ-1001",
  "client_name": "acme corp",
  "presentation_title": "",
  "agenda": "Platform overview\n  Pricing review",
  "pricing_summary": "Enterprise tier, annual billing",
  "next_steps": "Schedule security review"
}
```

Check that a new deck appears in the connected Google Drive from the template, with the title and client name filled in and the agenda, pricing and next steps in their placeholders. Check that a Zapier Tables record exists with the request ID. Then run the same sample again and check that the run stops at the Storage check and creates no second deck. If run-status tools aren't available, check the result in Google Slides and Zapier Tables directly. Ask the user to delete the test deck and test record; the agent doesn't delete them.

Once the test passes, publish, confirm the trigger is active, and give the user their webhook URL to point the request sender at.

## Notes

- Each run that passes the Storage check creates one deck, so it uses one deck of your Google quota.
- Storage keys are capped at 32 characters, so a longer request ID is truncated in the key.
- A request under a new ID for an account already in the table creates a second record, so check the table for duplicates.
- Anyone with the webhook URL can create decks in your account. Keep it private, and never commit it, the template ID or the table ID.
- To extend it: send the presentation link to the CRM owner or a deal channel after the deck is made, add text steps to format dates and currency for each region, or choose a different template by deal tier.
