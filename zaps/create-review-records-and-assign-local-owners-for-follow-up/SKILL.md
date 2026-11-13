---
name: create-review-records-and-assign-local-owners-for-follow-up
description: Build a Zap on Zapier that writes each new Google Business Profile review into a Zapier Table, one row per review, and updates the row if the same review arrives again. Use when a business or agency collects public reviews for one or more locations and wants them in a shared table for triage and reporting.
license: MIT
metadata:
  author: zapier
  summary: "Every new Google review is saved as a row in your review table, so your team can follow up on it from one place."
  apps: "Google Business Profile, Zapier Tables"
  category: "Marketing"
  job: "Review reputation management"
  source: "https://zapier.com/automations/marketing/review-reputation-management/review-collection/create-review-records-and-assign-local-owners-for-follow-up"
---

# Create review records and assign local owners for follow up

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-review-records-and-assign-local-owners-for-follow-up. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new review arrives for the watched Google Business Profile location (`google-business-profile`, `new_review_v3`).
2. **Zapier Tables** looks for a row whose External ID equals the review ID.
3. If none is found, **Zapier Tables** creates a row with the review text, reviewer name, rating and received time.
4. If one is found, **Zapier Tables** updates that row instead, so a repeated review does not create a duplicate.

Owner assignment is not part of this Zap, so there is no owner field or rule to set up.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting               | What goes there                                               |
| --------------------- | ------------------------------------------------------------- |
| `REPLACE_LOCATION_ID` | The Google Business Profile location to watch for new reviews |
| `REPLACE_TABLE_ID`    | The Zapier Table that holds one row per review                |

Defaults worth reviewing with them:

- `FIELD`: the table's field keys. The table needs five fields in this order: External ID, Review text, Reviewer name, Rating (number), Received at (date & time). Change the keys if the table differs.
- `REVIEW_ID_KEY`, `REVIEW_TEXT_KEY`, `REVIEWER_NAME_KEY`, `RATING_KEY`, `RECEIVED_AT_KEY`: the trigger's payload keys. They are not yet checked against a live sample, so confirm them with the trigger's fields once Google Business Profile is connected.
- `STAR_WORDS`: maps Google's star words (such as `FIVE`) to numbers. Leave as is unless the trigger sends something else.

Question to ask:

- Should a review with no timestamp be stamped with the time it was received? The Zap uses `now` when none arrives.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `zapier-tables` (the account that owns the review table) to the user's Zapier Tables connection. Bind `google-business-profile` (the account that manages the location; the trigger uses it) to the user's Google Business Profile connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-review.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test before publishing:

```json
{
  "review_id": "sample-review-001",
  "comment": "Great service",
  "reviewer_name": "Sample Reviewer",
  "star_rating": "FIVE",
  "create_time": "2026-10-29T12:00:00Z"
}
```

Confirm that one row appears in the table with External ID `sample-review-001`, Rating `5`, and the review text and reviewer name. Then run it again with the same `review_id` and `star_rating` set to `FOUR`. Confirm there is still one row for that ID, now showing rating 4. If run-status tools aren't available, check the result in Zapier Tables directly. Ask the user to delete the test rows; the agent does not delete them.

## Notes

- Google reports star ratings as words (for example `FIVE`). `STAR_WORDS` converts them to numbers for the Rating field.
- Two rows that share a review ID are not expected: the lookup uses the most recently created match, so the update goes to that row.
- To alert on negative ratings, add a Slack step after the table write that posts when the rating is 2 or lower. To normalize translated review text, add a formatter step before the table write.
- Never commit a real table ID or location ID.
