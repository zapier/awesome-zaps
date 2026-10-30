---
name: update-deal-opt-in-status-from-incoming-webhook-payloads
description: Build a Zapier Next Gen Zap that receives consent signals on a webhook and writes the opt-in or opt-out status to the matching Pipedrive deal. Use when a form, consent tool or script posts opt-in or opt-out events and sales should see current consent on the deal.
metadata:
  author: zapier
  summary: "When a consent signal arrives, the matching Pipedrive deal's consent field is set to opt-in or opt-out, so sales sees current consent on the deal."
  apps: "Webhooks by Zapier, Pipedrive"
  category: "Legal"
  job: "Privacy compliance"
  source: "https://zapier.com/automations/legal/privacy-compliance/consent-management/update-deal-opt-in-status-from-incoming-webhook-payloads"
---

# Update deal opt-in status from incoming webhook payloads

## What it does

1. **Trigger:** a consent signal arrives at a Webhooks by Zapier catch hook (a form, consent tool or script posts to it).
2. **Validation:** if the payload has no deal ID, the run stops and writes nothing. A missing opt-out flag counts as opt-in.
3. **Pipedrive** looks up the deal by its ID. If there is no match, the run stops and does not create a deal.
4. **Pipedrive** sets the deal's consent field to `YES` for opt-in, or `NO` when the opt-out flag is `true`.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (the alias in the code is the app's slug):
   - `pipedrive`: the user's Pipedrive connection, for the account that owns the deals.
3. **Constants:**
   - `DEAL_ID_KEY`: the payload key holding the Pipedrive deal ID. Set to `"deal_id"`.
   - `OPT_OUT_KEY`: the payload key holding the opt-out flag. Set to `"opt_out"`.
   - `CONSENT_FIELD_KEY`: the API key of the consent custom field on the deal. Placeholder `YOUR_CONSENT_FIELD_KEY`.
   - `OPT_IN_VALUE` and `OPT_OUT_VALUE`: the values written to the consent field. Default to `"YES"` and `"NO"`.
   - `PIPEDRIVE_CONNECTION`: the Pipedrive connection alias.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point their consent system at.

## Ask the user

- What are the deal ID and opt-out keys in the payload? The code assumes `deal_id` and `opt_out`; change `DEAL_ID_KEY` and `OPT_OUT_KEY` if the sender uses other names.
- Which Pipedrive custom field holds consent, and what is its API key? What values should it take?
- Should a missing opt-out flag mean opt-in, as this zap assumes, or should the run stop?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, using a deal ID that exists in a test Pipedrive account:

```json
{
  "deal_id": "123",
  "opt_out": true
}
```

Confirm that only that deal changed: the consent field reads `NO`. Then send an opt-in payload (`"opt_out": false`) and confirm the field reads `YES`. Use a deal created for the test and name it "[install-test] …".

No test run has been made.

## Customize

- **Create on miss:** create a placeholder deal or contact when no deal matches the incoming ID.
- **Consent note:** add a Pipedrive note or activity on each consent change, so reps see the context.

## Notes

- Duplicate payloads are not filtered. Each delivery writes the deal again.
- If the deal ID is not found, Pipedrive may return an error rather than an empty result, and the run would fail rather than skip.
- Never commit a real Pipedrive field key or webhook URL. Anyone with the webhook URL can change consent on deals.
