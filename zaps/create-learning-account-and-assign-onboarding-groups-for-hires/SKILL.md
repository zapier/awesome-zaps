---
name: create-learning-account-and-assign-onboarding-groups-for-hires
description: Build a Zap on Zapier that, when a new employee is added in BambooHR, finds or creates their Go1 learning account by work email and assigns them to the Go1 onboarding training groups for their division and location. Use when an HR, People or L&D team runs onboarding training in Go1 and wants every new BambooHR hire enrolled in the right training groups without manual setup.
license: MIT
metadata:
  author: zapier
  summary: "When a new employee is added in BambooHR, they get a Go1 learning account and join the onboarding training groups for their division and location, so required courses are waiting on day one."
  apps: "BambooHR, Go1"
  category: "Human Resources (HR)"
  job: "Learning development"
  source: "https://zapier.com/automations/human-resources-hr/learning-development/training-assignment/create-learning-account-and-assign-onboarding-groups-for-hires"
---

# Create learning account and assign onboarding groups for hires

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-learning-account-and-assign-onboarding-groups-for-hires. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new employee is created in BambooHR.
2. If the employee has no work email, or their BambooHR division has no group mapping, the run stops and changes nothing in Go1.
3. The hire's BambooHR location decides the path: locations in `LOCAL_LOCATIONS` take the division's local groups, every other location takes its international groups.
4. **Go1** looks up a user by the work email. If none exists, **Go1** creates one with the hire's first and last name and sends Go1's welcome email.
5. **Go1** assigns the user to the training groups for that division and path.

The Zap only reads from BambooHR and never changes a BambooHR record.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                          | What goes there                                                                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_LOCAL_LOCATION`         | A BambooHR location that counts as a local hire, spelled exactly as BambooHR spells it. Add one string to `LOCAL_LOCATIONS` per location |
| `REPLACE_DIVISION_NAME`          | A BambooHR division that gets onboarding groups, spelled exactly as BambooHR spells it. Repeat the `GROUPS_BY_DIVISION` entry for each   |
| `REPLACE_LOCAL_GROUP_ID`         | The Go1 group that division's local hires join, picked by name and looked up with the user's Go1 connection                              |
| `REPLACE_INTERNATIONAL_GROUP_ID` | The Go1 group that division's international hires join, looked up the same way                                                           |

Review the default with them: `NOTIFY_NEW_USER` in `config.ts` (`"True"` sends Go1's welcome email to new users; `"False"` skips it).

Before turning it on, confirm the work email in BambooHR is the same address hires sign in to Go1 with. Matching relies on it.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `bamboohr` (the trigger's account, for the user's BambooHR) and `go1` (the user's Go1 account, for the portal where onboarding groups live) to the user's connections. Both are used.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-employee.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a test learner's details. Replace the two sample values with a location and division from the mapping:

```json
{
  "id": "4321",
  "workEmail": "new.hire@example.com",
  "firstName": "Jordan",
  "lastName": "Rivera",
  "location": "Sample Office",
  "division": "Sample Division"
}
```

Check that Go1 has one user for that email and that they belong to the division's local groups. Run the same input again and check that no duplicate user is added. Then send a sample with an unmapped division and check that the run skips with `division-not-mapped`. If run-status tools aren't available, check Go1 directly. Ask the user to remove the test learner from Go1 afterwards; the agent doesn't delete test data. Then publish and confirm the trigger is active.

## Notes

- Go1 user profiles only take email, first name and last name here, so location and division drive routing but are not written to the Go1 profile.
- Hires who already have a Go1 account are still assigned to their onboarding groups.
- BambooHR fires this trigger when the employee record is created, which can be well before the start date. Use BambooHR's New Employee Started trigger instead if accounts should appear on day one.
- Division and location must match the mapping exactly, including capitalization.
- To customize: add a Go1 Create Enrollment step after the group assignment to enroll new users in mandatory courses, or route senior hires to managerial groups as well.
