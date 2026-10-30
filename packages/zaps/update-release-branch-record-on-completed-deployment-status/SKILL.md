---
name: update-release-branch-record-on-completed-deployment-status
description: Build a Zapier Next Gen Zap that, when a Salesforce deployment metadata log entry is marked Completed, finds the matching branch record and writes its production-release flag, hotfix flag and last UAT deployment date. Use when a release team tracks deployments in Salesforce and wants each branch record updated automatically when a deployment finishes.
metadata:
  author: zapier
  summary: "When a deployment finishes, the release branch record in Salesforce is updated to show it reached production, whether it was a hotfix, and when it was last deployed to UAT."
  apps: "Salesforce"
  category: "Engineering"
  job: "Software delivery"
  source: "https://zapier.com/automations/engineering/software-delivery/release-management/update-release-branch-record-on-completed-deployment-status"
---

# Update release branch record on completed deployment status

## What it does

1. **Trigger:** a Salesforce "Updated Field on Record" trigger watches the deployment metadata log object for changes to its status field.
2. The run stops unless the status is `Completed`, the process type is a deployment, the run result is `Success`, and no error field is filled in.
3. **Salesforce** finds the branch record whose ID matches the branch reference on the metadata log entry. If none matches, the run stops and creates nothing.
4. The release-type value is mapped to the hotfix flag (`Hotfix` is true, anything else is false).
5. **Salesforce** updates that branch record: the production-release checkbox is set to true, the hotfix checkbox gets the mapped flag, and the last UAT deployment datetime gets the deployment date from the log entry.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top; everything else stays as written.

1. **Trigger:** Salesforce, "Updated Field on Record" (`updated_field_on_record`). Set the object to the deployment metadata log object. Watch the status field.
2. **Connections** (each alias in the code is the app's slug):
   - `salesforce`: a Salesforce connection for the org that holds the metadata log and branch objects. Use a sandbox or integration org for testing.
3. **Constants:**
   - `METADATA_LOG_OBJECT`, `BRANCH_OBJECT`: Salesforce object API names.
   - `STATUS_FIELD`, `COMPLETED_VALUE`: the status field and the value that means finished.
   - `BRANCH_REFERENCE_FIELD`, `BRANCH_ID_FIELD`: the metadata log field holding the branch reference, and the branch field it matches.
   - `PROCESS_TYPE_FIELD`, `DEPLOYMENT_PROCESS_TYPE`, `RUN_RESULT_FIELD`, `SUCCESS_RESULT_VALUE`, `ERROR_FIELD`: fields used by the filter.
   - `RELEASE_TYPE_FIELD`, `HOTFIX_LOOKUP`: the release-type field and its mapping to the hotfix flag.
   - `DEPLOYMENT_DATE_FIELD`: the metadata log field with the deployment date.
   - `PRODUCTION_RELEASE_FIELD`, `HOTFIX_FIELD`, `LAST_UAT_DEPLOYMENT_FIELD`: the branch fields to write.
   - Every value shipped in this file is a `YOUR_…` placeholder for the org's API names, except `Completed`, `Deployment`, `Success` and the `Regular`/`Hotfix` lookup keys, which are examples to confirm.

## Ask the user

- What are the Salesforce API names of the deployment metadata log object and the branch object?
- Which metadata log field holds the status, the process type, the run result, the error flag, the release type and the deployment date? Which field holds the branch reference, and which branch field matches it?
- What values mean "Completed", "Deployment", "Success" and "Hotfix" in the org? Is any value other than `Hotfix` also a hotfix?
- Which branch fields are the production-release checkbox, the hotfix checkbox and the last UAT deployment datetime?

## Test

There was no Salesforce connection on the account to test with. To test, use a sandbox connection and a branch record and metadata log entry named "[install-test] …". Set the metadata log entry's status to `Completed` and its run result to `Success`. Then check that:

- the branch record's production-release box is checked;
- the hotfix box matches the release type;
- the last UAT deployment datetime equals the log entry's deployment date;
- a log entry with a non-matching status, process type or run result, or with an error, changes nothing;
- a log entry whose branch reference matches no record creates no record.

## Customize

- **Alert on failures:** add an optional alert step that notifies release owners for any stopped or errored run.
- **Per-environment timestamps:** add conditional paths that write different timestamp fields for production and UAT.

## Notes

- The workflow never creates branch records. A missing match stops the run.
- Each Salesforce step is one action, so a failed update shows up as a failed step in the run history.
- Never commit real Salesforce object names, record IDs or connection details into the constants; keep the `YOUR_…` placeholders in the shared copy.
