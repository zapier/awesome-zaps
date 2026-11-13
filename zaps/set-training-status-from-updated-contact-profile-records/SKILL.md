---
name: set-training-status-from-updated-contact-profile-records
description: Build a Zap on Zapier that watches a HubSpot contact's training property and writes a normalized true/false training-status flag back to that contact, so HR and compliance have a queryable status. Use when HR or compliance tracks training completion in HubSpot contact properties and wants a clean completed/not-completed flag without manual edits.
license: MIT
metadata:
  author: zapier
  summary: "When a contact's training status changes in HubSpot, a simple true/false flag on that contact is updated to match, so compliance can filter on it."
  apps: "HubSpot"
  category: "Human Resources (HR)"
  job: "HR compliance"
  source: "https://zapier.com/automations/human-resources-hr/hr-compliance/compliance-training-management/set-training-status-from-updated-contact-profile-records"
---

# Set training status from updated contact profile records

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/set-training-status-from-updated-contact-profile-records. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a HubSpot contact's training property changes (`hubspot`, `updated_contact_resthook_v3`, watching the training property).
2. **Check:** if the property is empty, the run stops and writes nothing. If the value is in `COMPLETED_VALUES` (case-insensitive), the flag is `"true"`. Any other non-empty value gives `"false"`.
3. **HubSpot** updates that contact: the status flag property is set to the flag, matched by the contact's internal ID. This overwrites the previous flag each time.

An empty training value is skipped, never written as `"false"`, so an unknown status is never reported as incomplete.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                        | Where                                                                | What goes there                                                                                          |
| ------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `REPLACE_TRAINING_PROPERTY`    | `config.ts`; `triggers/updated-contact-resthook.ts`, `property_name` | The HubSpot contact property that holds the training status                                              |
| `REPLACE_STATUS_FLAG_PROPERTY` | `config.ts`                                                          | The HubSpot checkbox contact property that receives `"true"` or `"false"`. Create it if it doesn't exist |

Also review the default with them: `COMPLETED_VALUES` in `workflow.ts` (`["completed"]` by default), the lowercase training values that count as completed. Ask whether the portal has a dedicated HubSpot connection for this workflow; if it does, use that one.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `hubspot` to the user's HubSpot connection for the portal that holds the training properties. The trigger and the action use the same one.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-contact-resthook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test against a test contact in a sandbox or test portal, with the training property the user chose:

```json
{
  "id": "3900001",
  "property_name": "training_status",
  "property_value": "Completed"
}
```

Check that the contact's flag property reads `true`. Then run again with `"property_value": "In progress"` and check that it reads `false`. If run-status tools aren't available, check the contact in HubSpot directly. Ask the user to delete the test contact and its data afterward; the agent doesn't delete it.

## Notes

- The flag is written as the strings `"true"` and `"false"`, which HubSpot checkbox properties accept.
- Customize: add a task or HR notification after the update, when `completed` is false, or a scheduled weekly report that searches HubSpot for contacts with an empty training property.
- Don't commit a real HubSpot property name or contact ID to a shared copy of this file.
