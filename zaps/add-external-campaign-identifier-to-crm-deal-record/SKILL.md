---
name: add-external-campaign-identifier-to-crm-deal-record
description: Build a Zap on Zapier that writes an external campaign or tracking ID onto the matching Pipedrive deal when a marketing or lead system posts it by webhook, so attribution survives into sales. Use when marketing tools, landing pages or ad platforms send campaign IDs and sales needs them on the deal record.
license: MIT
metadata:
  author: zapier
  summary: "When a marketing system posts a campaign ID for a deal, that ID is saved on the deal in Pipedrive, so sales can see where the deal came from."
  apps: "Webhooks by Zapier, Pipedrive"
  category: "Sales"
  job: "CRM management"
  source: "https://zapier.com/automations/sales/crm-management/crm-data-enrichment/add-external-campaign-identifier-to-crm-deal-record"
---

# Add external campaign identifier to CRM deal record

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/add-external-campaign-identifier-to-crm-deal-record. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a payload arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). A marketing tool, landing page or script posts to it.
2. **Filter:** the run continues only if the payload has both a deal ID (`deal_id`) and an external campaign identifier. The identifier is taken from `campaign_id`, then `utm_campaign`, then `external_id`, whichever is present first. Otherwise the run stops and writes nothing.
3. **Pipedrive** looks up the deal by that ID. If the deal doesn't exist, or its external ID field already holds the same value, the run stops.
4. **Pipedrive** updates the deal, overwriting its external ID field with the incoming value.

No new deals are created from webhooks.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting             | What goes there                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `EXTERNAL_ID_FIELD` | The key of the custom Pipedrive deal field that stores the external campaign identifier (Settings > Data fields) |

Defaults worth reviewing with them: the Zap overwrites whatever the field holds with the newest identifier. It does not only fill empty fields.

Prerequisite question: which payload fields carry the deal ID and the campaign ID? The code expects `deal_id` and one of `campaign_id`, `utm_campaign` or `external_id`. If the sender uses other names, change those keys in `workflow.ts` before installing.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `pipedrive` to the user's Pipedrive connection, for the account that owns the deals. The webhook catch hook needs no account.
2. **Source:** publish `workflow.ts` and `config.ts`, with `EXTERNAL_ID_FIELD` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test, with `deal_id` set to a test deal in the user's Pipedrive account:

```json
{
  "deal_id": 123,
  "campaign_id": "[install-test] spring-2026-webinar",
  "utm_campaign": "spring-2026-webinar",
  "external_id": "ext-0001"
}
```

Check that the deal's external ID field now shows `[install-test] spring-2026-webinar`, and no other field on the deal changed. Then send a second payload with no `deal_id`. It should stop at the filter and write nothing. If run-status tools aren't available, check the result in Pipedrive directly. Then publish, confirm the trigger is active, and give the user their webhook URL to point the sending system at. The user deletes test data, not the agent.

## Notes

- Anyone with the webhook URL can write to the deal's external ID field. Keep the URL private.
- The overwrite rule keeps only the latest campaign in the field.
- If `deal_id` is not a Pipedrive deal ID, the lookup stops the run and nothing is written.
- To alert marketing ops when a payload is skipped, add a Slack or email step after the filter. To keep an audit trail, append a timestamped note with the original payload to the deal.
