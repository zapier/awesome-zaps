---
name: create-internal-intake-records-from-partner-form-entries
description: Build a Zapier Next Gen Zap that copies each new partner application from a Jotform Enterprise form into your internal intake form, so nobody rekeys it. Use when a partner channel or sales team collects applications in one Jotform and triages them in another.
metadata:
  author: zapier
  summary: "Each partner application submitted in Jotform is copied into your internal intake form automatically, so vendor triage starts without rekeying."
  apps: "Jotform Enterprise"
  category: "Sales"
  job: "Partner channel sales"
  source: "https://zapier.com/automations/sales/partner-channel-sales/partner-onboarding/create-internal-intake-records-from-partner-form-entries"
---

# Create internal intake records from partner form entries

## What it does

1. **Trigger:** a new submission arrives on the partner application form in Jotform Enterprise.
2. **Jotform Enterprise** creates a submission on the internal intake form, copying each partner answer into the matching intake field.
3. **Optional:** the same submission is created on a second intake form, for a separate review queue.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**Check the fields first:** with your own Jotform Enterprise connection, inspect the trigger and the create-submission action (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches the form field keys before you publish.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top; everything else stays as written.

1. **Trigger:** Jotform Enterprise, New Submission (`new_submission`). Set it to your partner application form.
2. **Connections** (each alias in the code is the app's slug):
   - `jotform-enterprise`: your Jotform Enterprise connection, for the account that owns both forms.
3. **Constants:**
   - `WORKSPACE_ID`: the Jotform team workspace that holds the forms.
   - `INTAKE_FORM_ID`: the internal intake form that receives each copy.
   - `SECONDARY_INTAKE_FORM_ID`: the optional second intake form. Leave it empty to skip that step.
   - `FIELD_MAP`: internal intake field key on the left, partner form answer key on the right. Map each intake field you need.

## Ask the user

- Which Jotform workspace holds the forms, and which form is the partner application?
- Which form is the internal intake form, and is there a secondary review-queue form?
- Which partner answers map to which intake fields?

## Test

Run a sample submission on the partner form, then check the intake form:

```json
{
  "id": "1234567890123456789",
  "name": "Test Partner",
  "email": "partner@example.com",
  "company": "Example Co",
  "notes": "Interested in the reseller program"
}
```

Confirm that one new record appears on the intake form with the mapped fields filled in, and that the secondary form (if set) gets its own copy. Delete the test records afterwards if they are not real.

## Customize

- **Conditional routing:** send each submission to a different intake owner by product line or program, using a branch on the answer before the create step.
- **Normalize fields:** add a formatting step that normalizes phone and date formats before the internal submission is created.

## Notes

- Jotform creates the intake submission with its own timestamp. Preserving the partner's original submit time needs a field on the intake form that takes it.
- Attachments are copied when the partner form has a file-upload answer mapped in `FIELD_MAP`. Nothing is copied when the answer is empty.
- Jotform Enterprise has no search action, so the workflow does not check for an existing intake record with the same submission ID. Each new partner submission creates one intake record.
- Never commit a real form ID, workspace ID or submission data. Anyone who can see the source can see where your partner applications go.
