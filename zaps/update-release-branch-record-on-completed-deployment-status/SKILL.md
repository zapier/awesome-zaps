---
name: update-release-branch-record-on-completed-deployment-status
description: Build a Zap on Zapier that, when a Salesforce deployment metadata log entry is marked Completed, finds the matching branch record and writes its production-release flag, hotfix flag and last UAT deployment date. Use when a release team tracks deployments in Salesforce and wants each branch record updated automatically when a deployment finishes.
license: MIT
metadata:
  author: zapier
  summary: "When a deployment finishes, the release branch record in Salesforce is updated to show it reached production, whether it was a hotfix, and when it was last deployed to UAT."
  apps: "Salesforce"
  category: "Engineering"
  job: "Software delivery"
  source: "https://zapier.com/automations/engineering/software-delivery/release-management/update-release-branch-record-on-completed-deployment-status"
---

# Update release branch record on completed deployment status

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-release-branch-record-on-completed-deployment-status. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Salesforce "Updated Field on Record" trigger (`salesforce`, `updated_field_on_record`) watches the deployment metadata log object for changes to its status field.
2. The run stops unless the status is `Completed`, the process type is `Deployment`, the run result is `Success`, and no error field is filled in.
3. **Salesforce** finds the branch record whose ID matches the branch reference on the metadata log entry. If none matches, the run stops and creates nothing.
4. The release-type value is mapped to the hotfix flag (`Hotfix` is true, anything else is false).
5. **Salesforce** updates that branch record: the production-release checkbox is set to true, the hotfix checkbox gets the mapped flag, and the last UAT deployment datetime gets the deployment date from the log entry.

The Zap never creates branch records. A missing match stops the run.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                             | What goes there                                                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `REPLACE_METADATA_LOG_OBJECT`       | The Salesforce API name of the deployment metadata log object. The trigger watches this object.                   |
| `REPLACE_BRANCH_OBJECT`             | The Salesforce API name of the branch object whose record gets updated                                            |
| `REPLACE_STATUS_FIELD`              | The metadata log field that holds the deployment status. The trigger watches it, and the Zap runs when it changes |
| `REPLACE_BRANCH_REFERENCE_FIELD`    | The metadata log field that references the branch record                                                          |
| `REPLACE_BRANCH_ID_FIELD`           | The branch field the reference is matched against, usually the branch ID                                          |
| `REPLACE_PROCESS_TYPE_FIELD`        | The metadata log field that holds the process type                                                                |
| `REPLACE_RUN_RESULT_FIELD`          | The metadata log field that holds the run result                                                                  |
| `REPLACE_ERROR_FIELD`               | The metadata log field that is filled in when the run errored                                                     |
| `REPLACE_RELEASE_TYPE_FIELD`        | The metadata log field that holds the release type, regular or hotfix                                             |
| `REPLACE_DEPLOYMENT_DATE_FIELD`     | The metadata log field that holds the deployment date                                                             |
| `REPLACE_PRODUCTION_RELEASE_FIELD`  | The branch checkbox that is set to true when the release reaches production                                       |
| `REPLACE_HOTFIX_FIELD`              | The branch checkbox that records whether the release is a hotfix                                                  |
| `REPLACE_LAST_UAT_DEPLOYMENT_FIELD` | The branch datetime field that holds the last UAT deployment                                                      |

Also review these defaults with them: `COMPLETED_VALUE` (`Completed`), `DEPLOYMENT_PROCESS_TYPE` (`Deployment`) and `SUCCESS_RESULT_VALUE` (`Success`) in `config.ts` must match the org's values. In `HOTFIX_LOOKUP` in `workflow.ts`, `Hotfix` counts as a hotfix; ask whether any other release-type value does too.

Ask which org the Salesforce connection points at. Use a sandbox or integration org for testing.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `salesforce` to the user's Salesforce connection for the org that holds the metadata log and branch objects.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-field-on-record.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. Set the trigger's object to `METADATA_LOG_OBJECT` and its watched field to `STATUS_FIELD`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test against the sandbox. Create a branch record and a metadata log entry, both named "[install-test] …". Set the log entry's status to `Completed`, its process type to `Deployment`, its run result to `Success`, and leave its error field empty. Then check that:

- the branch record's production-release box is checked;
- the hotfix box matches the release type;
- the last UAT deployment datetime equals the log entry's deployment date;
- a log entry with a non-matching status, process type or run result, or with an error, changes nothing;
- a log entry whose branch reference matches no record creates no record.

If run-status tools aren't available, check the result in Salesforce directly. Ask the user to delete the test records; the agent doesn't delete them.

## Notes

- Each Salesforce step is one action, so a failed update shows up as a failed step in the run history.
- To alert release owners on any stopped or errored run, add an optional alert step that notifies them.
- To write different timestamp fields for production and UAT, add conditional paths that each write their own field.
