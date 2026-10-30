---
name: set-training-status-from-updated-contact-profile-records
description: Build a Zapier Next Gen Zap that watches a HubSpot contact's training property and writes a normalized true/false training-status flag back to that contact, so HR and compliance have a queryable status. Use when HR or compliance tracks training completion in HubSpot contact properties and wants a clean completed/not-completed flag without manual edits.
metadata:
  author: zapier
  summary: "When a contact's training status changes in HubSpot, a simple true/false flag on that contact is updated to match, so compliance can filter on it."
  apps: "HubSpot"
  category: "Human Resources (HR)"
  job: "HR compliance"
  source: "https://zapier.com/automations/human-resources-hr/hr-compliance/compliance-training-management/set-training-status-from-updated-contact-profile-records"
---

# Set training status from updated contact profile records

## What it does

1. **Trigger:** a HubSpot contact's training property changes (New Contact Property Change, watching `TRAINING_PROPERTY`).
2. **Check:** if the property is empty, the run stops and writes nothing. If the value is in `COMPLETED_VALUES` (case-insensitive), the flag is `"true"`. Any other non-empty value gives `"false"`.
3. **HubSpot** updates that contact: `STATUS_FLAG_PROPERTY` is set to the flag, matched by the contact's internal ID. This overwrites the previous flag each time.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** HubSpot, New Contact Property Change (`hubspot` / `updated_contact_resthook_v3`). Its `property_name` parameter must equal `TRAINING_PROPERTY`.
2. **Connections** (each alias in the code is the app's slug):
   - `hubspot`: the user's HubSpot connection, for the portal that holds the training properties.
3. **Constants:**
   - `TRAINING_PROPERTY`: the HubSpot contact property that holds the training status.
   - `STATUS_FLAG_PROPERTY`: the HubSpot checkbox property that receives `"true"` or `"false"`. Create it first if it doesn't exist.
   - `COMPLETED_VALUES`: the training values that count as completed, in lowercase.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user which HubSpot properties to use.

## Ask the user

- Which HubSpot contact property holds the training status, and what values does it take?
- Which checkbox property should receive the true/false flag?
- Which values mean completed? The default is `"completed"` only.
- Does the portal have a dedicated HubSpot connection for this workflow?

## Test

Before publishing, run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) against a test contact in a sandbox or test portal:

```json
{
  "id": "YOUR_TEST_CONTACT_ID",
  "property_name": "YOUR_TRAINING_PROPERTY",
  "property_value": "Completed"
}
```

Confirm that the contact's flag property reads `true`. Then run again with `"property_value": "In progress"` and confirm it reads `false`.

## Customize

- **Follow-up task or HR notification** on the non-completed path: add a step after the update that creates a task or sends a notification when `completed` is false.
- **Weekly exception report** for contacts missing a completion status: a scheduled workflow that searches HubSpot for contacts with an empty training property.

## Notes

- The flag is written as the strings `"true"` and `"false"`, which HubSpot checkbox properties accept.
- Records with an empty training value are skipped, not set to `false`, so an unknown status is never reported as incomplete.
- Never commit a real HubSpot property name or contact ID to a shared copy of this file.
