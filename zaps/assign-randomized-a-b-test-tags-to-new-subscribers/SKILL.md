---
name: assign-randomized-a-b-test-tags-to-new-subscribers
description: Build a Zap on Zapier that randomly sorts each new Kit subscriber into an A or B group by tagging them, so welcome sequences can run valid split tests. Use when a creator or marketer runs email A/B tests in Kit and wants an even, automatic 50/50 split without assigning people by hand.
license: MIT
metadata:
  author: zapier
  summary: "Each new subscriber is randomly placed in group A or group B with a tag, so your welcome emails can be split-tested without manual sorting."
  apps: "Kit"
  category: "Design"
  job: "User testing"
  source: "https://zapier.com/automations/design/user-testing/a-b-test-management/assign-randomized-a-b-test-tags-to-new-subscribers"
---

# Assign randomized A/B test tags to new subscribers

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/assign-randomized-a-b-test-tags-to-new-subscribers. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a subscriber is added to a Kit tag you choose (`kit`, `tagHook`).
2. **Random draw:** a whole number from 1 to 10,000,000 is drawn, once per subscriber, and kept with the run.
3. **Split:** draws at or below 5,000,000 go to group A; above it go to group B.
4. **Kit** adds the subscriber to the group A or group B tag, creating the subscriber if their email is not yet in Kit.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve tag names to IDs with the user's Kit connection; don't ask them to paste an ID you can look up.

| Setting                  | Where                        | What goes there                                                  |
| ------------------------ | ---------------------------- | ---------------------------------------------------------------- |
| `REPLACE_TRIGGER_TAG_ID` | `triggers/tag-hook.ts`, `id` | The Kit tag that marks new subscribers who should enter the test |
| `REPLACE_TAG_A_ID`       | `config.ts`                  | The Kit tag for group A                                          |
| `REPLACE_TAG_B_ID`       | `config.ts`                  | The Kit tag for group B                                          |

The trigger tag must differ from both group tags, or the Zap re-triggers on its own tags.

Also review the defaults with them: `RANDOM_RANGE_MAX` and `RANDOM_MIDPOINT` in `config.ts` give about a 50/50 split. Change the midpoint for another ratio.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `kit` to the user's Kit connection. The trigger and the tag action both use it. No other app needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/tag-hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and put the trigger's `id` into the trigger's params. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's Kit connection, and sample the trigger, before the first test run. Fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a test subscriber on a Kit test account, using the trigger tag set to a test tag:

```json
{
  "email_address": "test+abtest@example.com",
  "first_name": "Test"
}
```

Check that the subscriber in Kit gets exactly one of the two group tags, that the run's `group` output matches `splitKey` (at or below 5,000,000 means A), and that over ten test subscribers both groups appear. If run-status tools aren't available, check the result in Kit directly. Then publish, confirm the trigger is active, and ask the user to delete the test subscribers in Kit. The agent doesn't delete them.

## Notes

- The workflow reads the email from `email_address` and the first name from `first_name`. Neither was checked against a real Kit payload. Confirm them in the first test run, since a wrong email name makes every run skip with `no-email`.
- A subscriber is tagged again each time they enter the trigger tag. Remove the trigger tag after tagging if you want one assignment per person.
- Kit's tag IDs change per account. Never commit a real tag ID.
- To extend it: a three-way or weighted split for multivariate tests, or weighting assignment by signup source.
