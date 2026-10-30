---
name: create-review-records-and-assign-local-owners-for-follow-up
description: Build a Zapier Next Gen Zap that writes each new Google Business Profile review into a Zapier Table, one row per review, and updates the row if the same review arrives again. Use when a business or agency collects public reviews for one or more locations and wants them in a shared table for triage and reporting.
metadata:
  author: zapier
  summary: "Every new Google review is saved as a row in your review table, so your team can follow up on it from one place."
  apps: "Google Business Profile, Zapier Tables"
  category: "Marketing"
  job: "Review reputation management"
  source: "https://zapier.com/automations/marketing/review-reputation-management/review-collection/create-review-records-and-assign-local-owners-for-follow-up"
---

# Create review records and assign local owners for follow up

## What it does

1. **Trigger:** a new review arrives for a configured Google Business Profile location (New Review).
2. **Zapier Tables** looks for a row whose External ID equals the review ID.
3. If none is found, **Zapier Tables** creates a row with the review text, reviewer name, rating and received time.
4. If one is found, **Zapier Tables** updates that row instead, so a repeated review does not create a duplicate.

Owner assignment is not part of this workflow. The source spec's steps do not map reviews to owners, so there is no owner field or rule to implement.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**Check the fields first:** with your own connections, inspect each action's input fields (`inspect_zapier_actions`), and get the New Review trigger's output keys with `get_trigger_fields` against a real review. Make the keys in `workflow.ts` match before you deploy it.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top.

1. **Trigger:** Google Business Profile, New Review (`google-business-profile`, `new_review_v3`). It needs a Google Business Profile connection for the account that manages the location.
2. **Connections** (each alias in the code is the app's slug):
   - `google-business-profile`: the user's Google Business Profile connection.
   - `zapier-tables`: the user's Zapier Tables connection.
3. **Constants:**
   - `TABLE_ID`: the table that stores reviews, from its URL.
   - `LOCATION_ID`: the Google Business Profile location to watch.
   - `FIELD`: the table's field keys. Create the table with five fields in this order: External ID, Review text, Reviewer name, Rating (number), Received at (date & time), or change the keys to match your table.
   - `REVIEW_ID_KEY`, `REVIEW_TEXT_KEY`, `REVIEWER_NAME_KEY`, `RATING_KEY`, `RECEIVED_AT_KEY`: the keys in the trigger's payload for each value.
   - `STAR_WORDS`: maps Google's star words (such as `FIVE`) to numbers. Leave as is unless the trigger sends something else.

## Ask the user

- Which Google Business Profile location (or locations) should feed the table?
- Which Zapier Table holds the reviews, and which of its fields are the external ID, review text, reviewer name, rating and received time?
- Should a review with no timestamp be stamped with the time it was received? The workflow uses `now` when no timestamp arrives.

## Test

Run this sample as a test run before publishing, with the keys the constants expect:

```json
{
  "review_id": "sample-review-001",
  "comment": "Great service",
  "reviewer_name": "Sample Reviewer",
  "star_rating": "FIVE",
  "create_time": "2026-10-29T12:00:00Z"
}
```

Confirm that one row appears in the table with External ID `sample-review-001`, Rating `5`, and the review text and reviewer name. Then run it again with the same `review_id` and a different `star_rating`, such as `FOUR`. Confirm there is still one row for that ID, now showing the new rating. Then delete the test rows.

## Customize

- **Negative-rating alert:** add a Slack step that posts to the on-call channel when `rating` is 2 or lower.
- **Translation normalization:** add a formatter step that converts translated review text into one language before it is written.

## Notes

- Google reports star ratings as words (for example `FIVE`). `STAR_WORDS` converts them to numbers for the Rating field.
- Two rows that share a review ID are not expected: the lookup uses the most recently created match, so the update goes to that row.
- Never commit a real table ID or location ID.
