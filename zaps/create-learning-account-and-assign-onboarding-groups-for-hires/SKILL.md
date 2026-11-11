---
name: create-learning-account-and-assign-onboarding-groups-for-hires
description: Build a Zapier Next Gen Zap that, when a new employee is added in BambooHR, finds or creates their Go1 learning account by work email and assigns them to the Go1 onboarding training groups for their division and location. Use when an HR, People or L&D team runs onboarding training in Go1 and wants every new BambooHR hire enrolled in the right training groups without manual setup.
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

## What it does

1. **Trigger:** a new employee is created in BambooHR.
2. If the employee has no work email, or their BambooHR division has no group mapping, the run stops and changes nothing in Go1.
3. The hire's BambooHR location decides the path: locations in `LOCAL_LOCATIONS` take the division's local groups, every other location takes its international groups.
4. **Go1** looks up a user by the work email. If none exists, **Go1** creates one with the hire's first and last name and sends Go1's welcome email.
5. **Go1** assigns the user to the training groups for that division and path.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** the files in this folder are the whole zap. `workflow.ts` is the workflow. It imports its settings from `config.ts` and each account from `connections/<alias>.ts`, and `triggers/` holds what starts it.

- **With the zap CLI:** `npx zap-pack add awesome-zaps/create-learning-account-and-assign-onboarding-groups-for-hires` (it makes a zap project if you aren't in one), then `npx zap-pack deploy create-learning-account-and-assign-onboarding-groups-for-hires` from that project. Deploy asks for each open setting and account, and sets the trigger.
- **With Zapier MCP:** publish every `.ts` file outside `triggers/` as `sourceFiles`, with three changes: write `config.ts` as plain values (`export const NAME = "value";`), write each `connections/<alias>.ts` as `export default "<alias>";`, and write each `@/name` import as a relative path ending in `.ts` (`./config.ts`, `./connections/<alias>.ts`). Set the trigger from the file in `triggers/`.

1. **Trigger:** BambooHR, New Employee (`bamboohr`, `new_employee`). It takes no trigger fields; its `authentication_id` is the user's BambooHR connection.
2. **Connections** (each alias in the code is the app's slug):
   - `bamboohr`: the user's BambooHR connection, used by the trigger.
   - `go1`: the user's Go1 connection, for the portal where onboarding groups live.
3. **Constants:**
   - `LOCAL_LOCATIONS`: BambooHR location names, exactly as BambooHR spells them, that count as local hires.
   - `GROUPS_BY_DIVISION`: one entry per BambooHR division name, each with a `local` and an `international` list of Go1 group IDs. Resolve group names to IDs with the choices on the Go1 Assign Group action's `id` field.
   - `NOTIFY_NEW_USER`: `"True"` sends Go1's welcome email to new users; `"False"` skips it.
4. Test with the steps below, then publish and wait until the trigger is active.

## Ask the user

- Which BambooHR locations count as local, and what are the international ones called?
- Which BambooHR divisions should get onboarding groups, and which Go1 groups does each division's local and international hires join?
- Should new Go1 users get the welcome email?
- Is the work email in BambooHR the same address hires sign in to Go1 with? Matching relies on it.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, with a division and location from the user's mapping and an email for a test learner the user agrees to create in Go1:

```json
{
  "id": "4321",
  "workEmail": "new.hire@example.com",
  "firstName": "Jordan",
  "lastName": "Rivera",
  "location": "YOUR_LOCAL_LOCATION",
  "division": "YOUR_DIVISION"
}
```

Confirm that Go1 has one user for that email, that they belong to the division's local groups, and that a second run with the same input adds no duplicate user. Then send a sample with an unmapped division and confirm the run skips with `division-not-mapped`. Remove the test learner from Go1 afterwards.

## Customize

- **Enroll in starter courses:** add a Go1 Create Enrollment step after the group assignment to enroll new users in mandatory courses.
- **Leadership path:** route senior hires (by job title or level) to managerial training groups as well.

## Notes

- Go1 user profiles only take email, first name and last name here, so location and division drive routing but are not written to the Go1 profile.
- Hires who already have a Go1 account are still assigned to their onboarding groups.
- BambooHR fires this trigger when the employee record is created, which can be well before the start date. Use BambooHR's New Employee Started trigger instead if accounts should appear on day one.
- Division and location must match the mapping exactly, including capitalization.
