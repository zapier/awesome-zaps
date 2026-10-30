---
name: update-deal-risk-profile-from-buyer-intent-feed
description: Build a Zapier Next Gen Zap that takes a buyer-intent signal arriving by webhook, finds the matching lead in Close by email, and writes the signals and notes into that lead's deal risk custom object, creating the record if it doesn't exist yet. Use when a sales team wants prioritized risk context on each lead as intent signals come in, and tracks deal risk in Close custom objects.
metadata:
  author: zapier
  summary: "When a buyer-intent signal comes in, the matching Close lead's deal risk record is updated with the signals and notes, so sales sees the risk context right away."
  apps: "Webhooks by Zapier, Close"
  category: "Sales"
  job: "Sales intelligence"
  source: "https://zapier.com/automations/sales/sales-intelligence/buyer-intent-tracking/update-deal-risk-profile-from-buyer-intent-feed"
---

# Update deal risk profile from buyer intent feed

## What it does

1. **Trigger:** a buyer-intent payload arrives at a Webhooks by Zapier catch hook (an intent feed or script posts to it). The payload carries the contact's `email`, an `intent_signals` list and optional `notes`.
2. **Close** finds the lead whose email matches `email`. If there is no match, the run stops and writes nothing.
3. **Close** looks for the lead's deal risk record (a custom object of the configured type). If there is none, it creates one.
4. **Close** updates that record: the intent signals go into the risk indicators field and the list field, and the notes go into the risk notes field.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run. The Close custom field keys depend on the user's Close custom object type, so they must be read from that type.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `close`: the user's Close connection, for the account whose leads and custom objects are being updated.
3. **Constants:**
   - `CUSTOM_OBJECT_TYPE_ID`: the ID of the Close custom object type that holds the deal risk record, from Close's Custom Objects settings.
   - `RISK_INDICATORS_FIELD`: the custom object field that receives the intent signals as text.
   - `RISK_NOTES_FIELD`: the custom object field that receives the notes.
   - `RISK_SIGNALS_LIST_FIELD`: the custom object list field that receives each intent signal as its own entry.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point their intent feed at.

## Ask the user

- Which Close custom object type holds the deal risk record, and what are the keys of its indicator, notes and list fields?
- Does the intent feed send the contact's email as `email`, the signals as `intent_signals` (a list, or one string), and notes as `notes`? If the feed uses other names, tell them before installing; the code reads those keys.

## Test

Run this sample as a test run (`run_workflow_draft` in Zapier MCP) before publishing, with an email that exists as a lead in the user's Close account:

```json
{
  "email": "jane@example.com",
  "intent_signals": [
    "Visited pricing page 3 times",
    "Downloaded security whitepaper"
  ],
  "notes": "Asked about SSO during the last webinar."
}
```

Confirm that the matching lead's deal risk record exists (created if it was missing), that its indicator, notes and list fields show the signals and notes from the payload, and that no other lead or record changed. Then tell the user to revert the record if the lead was real data. Run a second sample with an email that isn't in Close and confirm the run stops with `lead-not-found` and writes nothing.

## Customize

- **Notify sales** when a record crosses a risk level: add a Slack or email step after the update.
- **Create a follow-up task** for high-risk records: add a Close task step after the update.
- **Only continue for qualifying submissions** (for example high intent, or missing context): add a filter before the lead lookup.

## Notes

- Lead matching uses the email only. If two leads share an email, Close returns the best match.
- The list field is replaced with the current payload's signals on each run; earlier entries are not kept.
- Anyone with the webhook URL can write to these records. Never commit a real webhook URL, custom object type ID or field key.
