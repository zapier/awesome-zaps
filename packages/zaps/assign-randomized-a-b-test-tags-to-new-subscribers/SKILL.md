---
name: assign-randomized-a-b-test-tags-to-new-subscribers
description: Build a Zapier Next Gen Zap that randomly sorts each new Kit subscriber into an A or B group by tagging them, so welcome sequences can run valid split tests. Use when a creator or marketer runs email A/B tests in Kit and wants an even, automatic 50/50 split without assigning people by hand.
metadata:
  author: zapier
  summary: "Each new subscriber is randomly placed in group A or group B with a tag, so your welcome emails can be split-tested without manual sorting."
  apps: "Kit"
  category: "Design"
  job: "User testing"
  source: "https://zapier.com/automations/design/user-testing/a-b-test-management/assign-randomized-a-b-test-tags-to-new-subscribers"
---

# Assign randomized A/B test tags to new subscribers

## What it does

1. **Trigger:** a subscriber is added to a Kit tag you choose (Kit's "Subscriber Added to Tag" trigger).
2. **Random draw:** a whole number from 1 to 10,000,000 is drawn, once per subscriber, and kept with the run.
3. **Split:** draws at or below 5,000,000 go to group A; above it go to group B.
4. **Kit** adds the subscriber to the A-group or B-group tag (creating the subscriber if their email is not yet in Kit).

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Kit, Subscriber Added to Tag (`kit`, action `tagHook`). Set the `id` parameter to the tag that marks new subscribers who should enter the test.
2. **Connections** (each alias in the code is the app's slug):
   - `kit`: the user's Kit connection.
3. **Constants:**
   - `TAG_A_ID`: the Kit tag ID for group A.
   - `TAG_B_ID`: the Kit tag ID for group B. Use a different tag from the trigger tag, or the workflow will re-trigger on its own tags.
   - `RANDOM_RANGE_MAX` and `RANDOM_MIDPOINT`: the draw range and the split point. The defaults give about 50/50.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the trigger's webhook details if any.

## Ask the user

- Which Kit tag marks a new subscriber who should be in the test, and which tags are the A-group and B-group?
- Should the split be 50/50 (the default) or another ratio?
- Should a subscriber who already has an A or B tag be skipped, or re-assigned?

## Test

The draft test run needs a Kit connection, and the trigger's tag ID cannot be read without one. To test, use a test subscriber email on a Kit test account and a test tag:

```json
{
  "email_address": "test+abtest@example.com",
  "first_name": "Test"
}
```

Check that the subscriber in Kit gets exactly one of the two group tags, that the run's `group` output matches `splitKey` (at or below 5,000,000 means A), and that over ten test subscribers both groups appear. Remove the test subscriber afterwards.

## Customize

- **Three-way or weighted splits** for multivariate tests.
- **Weight assignment by signup source** to favor specific cohorts.

## Notes

- The trigger's payload field names for Kit were not read, because no connection was available. The workflow reads the email from `email_address` and the first name from `first_name`; check these against a real payload before publishing, since a wrong name makes every run skip with `no-email`.
- Kit's tag IDs are numbers that change per account. Never commit a real tag ID; the template uses placeholders.
- A subscriber is tagged again each time they enter the trigger tag, so remove the trigger tag if you want one assignment per person.
