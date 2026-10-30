---
name: add-training-program-link-to-new-person-records
description: Build a Zapier Next Gen Zap that, when a new Pipedrive person has a training or program reference, looks up the matching program in a Zapier Table and writes its link back to the person's record. Use when an HR or Talent Ops team keeps training programs in a Zapier Table and wants each new hire's Pipedrive record to get the right program link automatically.
metadata:
  author: zapier
  summary: "When a new person is added to Pipedrive with a training reference, the matching program link from your training table is copied onto their record, so no one has to look it up by hand."
  apps: "Pipedrive, Zapier Tables"
  category: "Human Resources (HR)"
  job: "Learning development"
  source: "https://zapier.com/automations/human-resources-hr/learning-development/training-assignment/add-training-program-link-to-new-person-records"
---

# Add training program link to new person records

## What it does

1. **Trigger:** Pipedrive, New Person (`personV2`) fires when a person record is created.
2. **Stop early** if the person has no training reference in the configured custom field.
3. **Zapier Tables** finds the row whose program key matches that reference exactly. If there is no match, the run stops and nothing is written. No table rows are created.
4. **Pipedrive** updates that same person with the program link from the matched row, in the configured link field. No new person is created.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill and follow it. This file says _what_ to build; that skill says _how_.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top.

1. **Trigger:** Pipedrive, New Person (`pipedrive` / `personV2`). No params. It needs the Pipedrive connection.
2. **Connections** (each alias in the code is the app's slug):
   - `pipedrive`: the user's Pipedrive connection, for the account whose people are being updated.
   - `zapier-tables`: the user's Zapier Tables connection, for the account that owns the training table.
3. **Constants:**
   - `TRAINING_TABLE_ID`: the table's ID, in its Zapier Tables URL.
   - `PROGRAM_KEY_FIELD` / `PROGRAM_LINK_FIELD`: the table field keys (such as `f1`, `f2`) for the program key to match and the program link to copy. Read them from the table's output schema.
   - `PERSON_TRAINING_FIELD`: the Pipedrive custom field key on the person that holds the training reference.
   - `PERSON_LINK_FIELD`: the Pipedrive custom field key on the person that receives the program link.
4. Test with the steps below, then publish, wait until the trigger is active, and point the user at the trigger's `webhook_url` only if they use a catch hook. This workflow uses Pipedrive's own trigger, so nothing else is needed.

## Ask the user

- Which Zapier Table holds the training programs, and which columns hold the program key and the program link?
- Which Pipedrive custom fields hold the training reference (input) and the program link (output)?
- Which Pipedrive connection should the workflow use?

## Test

The planned test, once a Pipedrive test or integration connection is available, is:

1. Create a Pipedrive test person named `[install-test] …` with the training reference field set to a key that exists in the table.
2. Run the draft with that person's ID and the reference as input.
3. Check that the table lookup returns the row, and that the person's link field now holds that row's program link.
4. Check that a person with an unknown key is skipped and nothing is written.

The only test performed was against a Zapier Tables test table (`[install-test] Training programs`) with one row, `[install-test] PROG-100`. A read of the find step returned the link at `old.data.f2`, which is what the code reads.

## Customize

- Add a Formatter by Zapier step to normalize lookup values (for example trim or change case) before the table search. In the workflow, add a plain JavaScript normalization before the `find-training-program` step.
- Add a notification step to alert Talent Ops when a person has no matching training. In the workflow, add a Slack or email step after the `no-matching-program` return.

## Notes

- Table matching is exact. If the table has more than one row with the same key, the lookup uses the most recently created one.
- A missing reference or a missing match skips the run quietly. Add the notification step above if you need to know about these.
- The Pipedrive field keys in `workflow.ts` are placeholders. Pipedrive custom field keys are account-specific, so set them before deploying.
