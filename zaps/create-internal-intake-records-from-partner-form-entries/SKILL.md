---
name: create-internal-intake-records-from-partner-form-entries
description: Build a Zap on Zapier that copies each new partner application from a Jotform Enterprise form into your internal intake form, so nobody rekeys it. Use when a partner channel or sales team collects applications in one Jotform and triages them in another.
license: MIT
metadata:
  author: zapier
  summary: "Each partner application submitted in Jotform is copied into your internal intake form automatically, so vendor triage starts without rekeying."
  apps: "Jotform Enterprise"
  category: "Sales"
  job: "Partner channel sales"
  source: "https://zapier.com/automations/sales/partner-channel-sales/partner-onboarding/create-internal-intake-records-from-partner-form-entries"
---

# Create internal intake records from partner form entries

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-internal-intake-records-from-partner-form-entries. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new submission arrives on the partner application form in Jotform Enterprise (`jotform-enterprise`, `new_submission`).
2. **Jotform Enterprise** creates a submission on the internal intake form, copying each partner answer into the matching intake field.
3. **Optional:** the same submission is created on a second intake form, for a separate review queue.

The Zap only creates records. It never edits or deletes a partner submission, and it does not check for an existing intake record first, so each new submission creates one.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                     | What goes there                                                                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WORKSPACE_ID`              | The Jotform workspace that holds the partner form and the intake forms; pick it from the user's Jotform Enterprise workspaces                              |
| `INTAKE_FORM_ID`            | The internal intake form that each partner submission is copied into                                                                                       |
| `REPLACE_INTAKE_FIELD_KEY`  | In `workflow.ts`, `FIELD_MAP`: the key of the intake form field that receives an answer. Repeat the pair for each field you map                            |
| `REPLACE_PARTNER_FIELD_KEY` | In `workflow.ts`, `FIELD_MAP`: the key of the partner form answer copied into that intake field. Pick both keys from the create-submission action's fields |

Also review the default with them: `SECONDARY_INTAKE_FORM_ID` is empty, so the Zap creates only the one intake record. Set it to a second intake form to also create a copy for a separate review queue.

Before building, confirm which Jotform form is the partner application. The trigger watches that form.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `jotform-enterprise` to the user's Jotform Enterprise connection for the account that owns both forms. The trigger and both create-submission actions use it.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-submission.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run a sample submission on the partner form, with no real data:

```json
{
  "id": "1234567890123456789",
  "name": "Test Partner",
  "email": "partner@example.com",
  "company": "Example Co",
  "notes": "Interested in the reseller program"
}
```

Confirm that one new record appears on the intake form with the mapped fields filled in, and that the secondary form (if set) gets its own copy. If run-status tools aren't available, check the intake form in Jotform directly. Ask the user to delete the test records, not the agent.

## Notes

- Jotform creates the intake submission with its own timestamp. Keeping the partner's original submit time needs a field on the intake form that takes it.
- Attachments are copied when a file-upload answer is mapped in `FIELD_MAP`. Nothing is copied when the answer is empty.
- To route each submission to a different intake owner by product line or program, add a branch on the answer before the create step. To normalize phone and date formats, add a formatting step before it.
- Never commit a real form ID, workspace ID or submission data. Anyone who can see the source can see where your partner applications go.
