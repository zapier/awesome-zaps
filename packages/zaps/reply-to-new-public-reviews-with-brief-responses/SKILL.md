---
name: reply-to-new-public-reviews-with-brief-responses
description: Build a Zapier Next Gen Zap that posts a short, friendly public reply to each new Google Business Profile review. Use when a local business wants every new review answered quickly with a templated thank-you, without writing each reply by hand.
metadata:
  author: zapier
  summary: "Each new Google review gets a short, friendly public reply posted under it, so reviewers hear back without you writing every response."
  apps: "Google Business Profile"
  category: "Marketing"
  job: "Review reputation management"
  source: "https://zapier.com/automations/marketing/review-reputation-management/review-response-management/reply-to-new-public-reviews-with-brief-responses"
---

# Reply to new public reviews with brief responses

## What it does

1. **Trigger:** Google Business Profile, New Review (`new_review_v3`), for one location. Each new review starts a run with its review name, ID, comment, star rating and reviewer display name.
2. **Code** builds a short reply from a fixed template, addressed to the reviewer's first name (or "there" if no name is given).
3. **Google Business Profile** posts the reply under the review (`create_reply`).

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top.

1. **Trigger:** Google Business Profile, New Review (`google-business-profile`, `new_review_v3`, read). Set `location` to the location to watch. Its `authentication_id` is the Google Business Profile connection ID.
2. **Connections** (the alias in the code is the app's slug):
   - `google-business-profile`: the Google Business Profile connection for the account that manages the location.
3. **Constants:**
   - `REPLY_TEMPLATE`: the public reply text. `{name}` is replaced by the reviewer's first name. Keep it short and on-brand; Google's content policy applies.
   - `NAME_FALLBACK`: the word used when the reviewer has no display name. Defaults to `"there"`.
4. Test with the steps below, then publish, wait until the trigger is active, and leave it enabled only once the test has passed.

## Ask the user

- Which Google Business Profile location should the trigger watch? (`location` is a dropdown on the trigger; choose it there.)
- Which Google account should be connected? It must be the account that manages the location.
- Is the template text right? Edit `REPLY_TEMPLATE` before publishing if not.

## Test

To test once a connection exists, run this sample as a draft test run (`run_workflow_draft`). It posts a real reply, so use a review you are happy to answer, or a test location:

```json
{
  "id": "REVIEW_ID",
  "name": "accounts/ACCOUNT_ID/locations/LOCATION_ID/reviews/REVIEW_ID",
  "comment": "Great service, thanks!",
  "starRating": "FIVE",
  "reviewer__displayName": "Sam Lee"
}
```

Confirm that the review shows a reply starting "Hi Sam," in Google Business Profile, and that the run's output has `reply` and `updated` set.

## Customize

- **Rating branch:** for low star ratings, send a team alert or skip the auto-reply and let a person respond. Not built.
- **Location-specific templates:** use a different `REPLY_TEMPLATE` per location for multi-site brands. Not built.

## Notes

- The reply is public and visible to everyone on Google. Test on a location you control.
- `create_reply` replaces an existing reply rather than skipping the review. The trigger only fires on new reviews, so this is rare, but a re-delivered review will get the template again.
- Reviewers' names come from Google. The workflow uses only the first word of the display name.
