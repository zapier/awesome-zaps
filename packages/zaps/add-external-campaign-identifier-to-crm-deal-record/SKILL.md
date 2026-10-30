---
name: add-external-campaign-identifier-to-crm-deal-record
description: Build a Zapier Next Gen Zap that writes an external campaign or tracking ID onto the matching Pipedrive deal when a marketing or lead system posts it by webhook, so attribution survives into sales. Use when marketing tools, landing pages or ad platforms send campaign IDs and sales needs them on the deal record.
metadata:
  author: zapier
  summary: "When a marketing system posts a campaign ID for a deal, that ID is saved on the deal in Pipedrive, so sales can see where the deal came from."
  apps: "Webhooks by Zapier, Pipedrive"
  category: "Sales"
  job: "CRM management"
  source: "https://zapier.com/automations/sales/crm-management/crm-data-enrichment/add-external-campaign-identifier-to-crm-deal-record"
---

# Add external campaign identifier to CRM deal record

## What it does

1. **Trigger:** a payload arrives at a Webhooks by Zapier catch hook (a marketing tool, landing page or script posts to it).
2. **Filter:** the run continues only if the payload has both a deal ID (`deal_id`) and an external campaign identifier. The identifier is taken from `campaign_id`, then `utm_campaign`, then `external_id`, whichever is present first. Otherwise the run stops and writes nothing.
3. **Pipedrive** looks up the deal by that ID. If the deal doesn't exist, or its external ID field already holds the same value, the run stops.
4. **Pipedrive** updates the deal, overwriting its external ID field with the incoming value.

No new deals are created from webhooks.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (the alias in the code is the app's slug):
   - `pipedrive`: the user's Pipedrive connection, for the account that owns the deals.
3. **Constants:**
   - `EXTERNAL_ID_FIELD`: the key of the Pipedrive custom deal field that stores the campaign identifier (Settings > Data fields). Replace `YOUR_PIPEDRIVE_CUSTOM_FIELD_KEY` before deploying.
   - `PIPEDRIVE_CONNECTION`: the connection alias, if the user's Pipedrive connection should be named something other than the app key.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point the sending system at.

## Ask the user

- Which Pipedrive custom field holds the external campaign ID? Give its field key for `EXTERNAL_ID_FIELD`.
- Which field in the webhook payload carries the deal ID, and which carries the campaign ID? The code expects `deal_id` and one of `campaign_id`, `utm_campaign` or `external_id`. If the sender uses other names, change those keys before installing.
- Should the external ID overwrite an existing value, or only fill empty fields? The code overwrites.

## Test

Run this sample as a test run before publishing, with a deal ID that exists in the user's Pipedrive account and a test value:

```json
{
  "deal_id": 123,
  "campaign_id": "[install-test] spring-2026-webinar",
  "utm_campaign": "spring-2026-webinar",
  "external_id": "ext-0001"
}
```

Check that the deal's external ID field now shows `[install-test] spring-2026-webinar`, and no other field on the deal changed. Then set the field back to its previous value if the deal is real data.

Send a second payload with no `deal_id`. It should stop at the filter and write nothing.

## Customize

- **Alert on skipped payloads:** add a Slack or email step to notify marketing ops when a payload is skipped.
- **Keep an audit note:** append a timestamped note to the deal with the original webhook payload.

## Notes

- Anyone with the webhook URL can write to the deal's external ID field. Keep the URL private.
- The overwrite rule replaces an existing value with the newest one, so the field holds the latest campaign only.
- If `deal_id` is not a Pipedrive deal ID, the lookup stops the run and nothing is written.
