---
name: update-deal-risk-profile-from-buyer-intent-feed
description: Build a Zap on Zapier that takes a buyer-intent signal arriving by webhook, finds the matching lead in Close by email, and writes the signals and notes into that lead's deal risk custom object, creating the record if it doesn't exist yet. Use when a sales team wants prioritized risk context on each lead as intent signals come in, and tracks deal risk in Close custom objects.
license: MIT
metadata:
  author: zapier
  summary: "When a buyer-intent signal comes in, the matching Close lead's deal risk record is updated with the signals and notes, so sales sees the risk context right away."
  apps: "Webhooks by Zapier, Close"
  category: "Sales"
  job: "Sales intelligence"
  source: "https://zapier.com/automations/sales/sales-intelligence/buyer-intent-tracking/update-deal-risk-profile-from-buyer-intent-feed"
---

# Update deal risk profile from buyer intent feed

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-deal-risk-profile-from-buyer-intent-feed. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a buyer-intent payload arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). An intent feed or script posts to it. The payload carries the contact's `email`, an `intent_signals` list and optional `notes`.
2. **Close** finds the lead whose email matches `email`. If there is no match, the run stops and writes nothing.
3. **Close** looks for the lead's deal risk record (a custom object of the configured type). If there is none, it creates one.
4. **Close** updates that record: the intent signals go into the risk indicators field and the list field, and the notes go into the risk notes field.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                   | What goes there                                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `CUSTOM_OBJECT_TYPE_ID`   | The Close custom object type that holds the deal risk record. Ask which type, then look up its ID with their Close connection |
| `RISK_INDICATORS_FIELD`   | The key of the field that receives the intent signals as text. Look up from `CUSTOM_OBJECT_TYPE_ID`                           |
| `RISK_NOTES_FIELD`        | The key of the field that receives the notes. Look up from `CUSTOM_OBJECT_TYPE_ID`                                            |
| `RISK_SIGNALS_LIST_FIELD` | The key of the list field that receives each intent signal as its own entry. Look up from `CUSTOM_OBJECT_TYPE_ID`             |

Also confirm that the intent feed sends the contact's email as `email`, the signals as `intent_signals` (a list, or one string), and notes as `notes`. If the feed uses other names, tell the user before installing, because the code reads those keys.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `close` to the user's Close connection for the account whose leads and custom objects get updated. Webhooks by Zapier needs no connection, so the trigger's `authentication_id` is `null`.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's Close connection and sample the trigger before the first test run. The custom field keys come from the user's custom object type, so check them against that type, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample once as a draft test run, with `email` set to a test lead the user controls in Close:

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

Check that the matching lead's deal risk record exists (created if it was missing), that its indicator, notes and list fields show the signals and notes from the payload, and that no other lead or record changed. Then run a second sample whose email isn't a lead in Close, and check that the run stops with `lead-not-found` and writes nothing. If run-status tools aren't available, check the result in Close directly. The user deletes the test record, not the agent. Then publish, confirm the trigger is active, and give the user their webhook URL to point the intent feed at.

## Notes

- Lead matching uses the email only. If two leads share an email, Close returns the best match.
- The list field is replaced with the current payload's signals on each run; earlier entries are not kept.
- Anyone with the webhook URL can write to these records. Never commit a real webhook URL, custom object type ID or field key.
- To notify sales when a record crosses a risk level, add a Slack or email step after the update. To create a follow-up task for high-risk records, add a Close task step after the update. To continue only for qualifying submissions, add a filter before the lead lookup.
