---
name: update-deal-opt-in-status-from-incoming-webhook-payloads
description: Build a Zap on Zapier that receives consent signals on a webhook and writes the opt-in or opt-out status to the matching Pipedrive deal. Use when a form, consent tool or script posts opt-in or opt-out events and sales should see current consent on the deal.
license: MIT
metadata:
  author: zapier
  summary: "When a consent signal arrives, the matching Pipedrive deal's consent field is set to opt-in or opt-out, so sales sees current consent on the deal."
  apps: "Webhooks by Zapier, Pipedrive"
  category: "Legal"
  job: "Privacy compliance"
  source: "https://zapier.com/automations/legal/privacy-compliance/consent-management/update-deal-opt-in-status-from-incoming-webhook-payloads"
---

# Update deal opt-in status from incoming webhook payloads

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-deal-opt-in-status-from-incoming-webhook-payloads. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a consent signal arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). A form, consent tool or script posts to it.
2. **Validation:** if the payload has no deal ID, the run stops and writes nothing. A missing opt-out flag counts as opt-in.
3. **Pipedrive** (`pipedrive`) looks up the deal by its ID. If there is no match, the run stops and does not create a deal.
4. **Pipedrive** sets the deal's consent field to `YES` for opt-in, or `NO` when the opt-out flag is `true`.

The Zap changes only the consent field of the one matching deal.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting             | What goes there                                                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `CONSENT_FIELD_KEY` | The API key of the Pipedrive deal custom field that stores consent. Ask which field it is, then look up its key with their Pipedrive connection |

Also review the defaults with them: `DEAL_ID_KEY` (`"deal_id"`) and `OPT_OUT_KEY` (`"opt_out"`), the payload keys that carry the deal ID and the opt-out flag, and `OPT_IN_VALUE` and `OPT_OUT_VALUE` (`"YES"` and `"NO"`), the values the consent field takes. Change the keys if their sender uses other names.

Confirm that a missing opt-out flag should count as opt-in, as this Zap assumes, or whether the run should stop instead.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `pipedrive` to the user's Pipedrive connection for the account that owns the deals. The Webhooks by Zapier catch hook needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connection and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match. Once it is published, give the user the webhook URL to point their consent system at.

## Test it

Run it once as a draft test run, using a deal created for the test in a test Pipedrive account and named "[install-test] …":

```json
{
  "deal_id": "123",
  "opt_out": true
}
```

Check that only that deal changed and its consent field reads `NO`. Then send an opt-in payload (`"opt_out": false`) and check that the field reads `YES`. If run-status tools aren't available, check the deal in Pipedrive directly. Then publish, confirm the trigger is active, and ask the user to delete the test deal.

## Notes

- Duplicate payloads are not filtered. Each delivery writes the deal again.
- If the deal ID is not found, Pipedrive may return an error rather than an empty result, so the run fails rather than skips.
- Never commit a real Pipedrive field key or webhook URL. Anyone with the webhook URL can change consent on deals.
- To extend it: create a placeholder deal or contact when no deal matches the incoming ID, or add a Pipedrive note or activity on each consent change so reps see the context.
