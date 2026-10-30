---
name: post-attendee-feedback-as-product-reviews-for-teams
description: Build a Zapier Next Gen Zap that posts each attendee feedback submission from a Typeform form to your review platform as a product review, so marketing and product teams get timely, publishable endorsements. Use when event or program attendees fill in a Typeform survey and the feedback should become reviews on a product page or review API without manual copying.
metadata:
  author: zapier
  summary: "Each attendee feedback form submission with a rating or review text is posted to your review platform, so good feedback becomes a publishable review without manual copying."
  apps: "Typeform, Webhooks by Zapier"
  category: "Product"
  job: "Product feedback management"
  source: "https://zapier.com/automations/product/product-feedback-management/user-feedback-collection/post-attendee-feedback-as-product-reviews-for-teams"
---

# Post attendee feedback as product reviews for teams

## What it does

1. **Trigger:** a Typeform form is submitted (Typeform, New Entry, for the form you choose).
2. **Filter:** if the submission has neither a rating nor review text, the run stops and posts nothing.
3. **Webhooks by Zapier** sends a JSON POST to your review platform's endpoint with the product identifier, the reviewer's name and email, and the review title, body and rating. The endpoint matches reviewers by email and creates a new review record for each qualifying submission.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**Check the fields first:** with the user's own connections, inspect the Typeform trigger's fields (`get_trigger_fields`) and make sure the field keys in `workflow.ts` match the form's output before the first test run. Webhooks by Zapier needs no connection.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Typeform, New Entry (`typeform`, `entries_resthook_v2`). Set `formId` to the form's ID. It needs the user's Typeform connection.
2. **Connections** (each alias in the code is the app's slug):
   - `webhook` (Webhooks by Zapier, POST action) needs no connection, so it has no alias.
3. **Constants** (all at the top of `workflow.ts`):
   - `TITLE_FIELD`, `BODY_FIELD`, `RATING_FIELD`, `NAME_FIELD`, `EMAIL_FIELD`: the Typeform field keys for each review field. Use the keys from a sample entry, not the question text.
   - `REVIEW_ENDPOINT_URL`: the POST URL of your review platform.
   - `PRODUCT_ID`: the identifier your review platform uses for this product.

## Ask the user

- Which Typeform form collects attendee feedback? Its ID goes in the trigger's `formId`.
- Which form questions hold the review title, review text, rating, reviewer name and reviewer email?
- What is the review platform's endpoint URL, and does it expect the same JSON field names as `workflow.ts` (`product_id`, `reviewer_name`, `customer_email`, `title`, `body`, `rating`)? If not, change the keys in the `data` object before installing.
- Which product identifier should every review carry?

## Test

Run a sample submission as a draft test run before publishing, using a submission that has a rating and text. The sample's keys are the form's field keys:

```json
{
  "YOUR_TITLE_FIELD_KEY": "Great follow-up after the workshop",
  "YOUR_BODY_FIELD_KEY": "The onboarding session answered every question I had.",
  "YOUR_RATING_FIELD_KEY": 5,
  "YOUR_NAME_FIELD_KEY": "Sample Attendee",
  "YOUR_EMAIL_FIELD_KEY": "attendee@example.com"
}
```

Check that the review platform received one POST with the product identifier, the reviewer's name and email, and the title, body and rating. Then run a second sample with no rating and no text: the run should stop at the filter and send nothing. Remove the sample review from the review platform afterward if it was real data.

## Customize

- **Moderate low ratings:** add a step that queues reviews below a rating threshold for manual approval instead of posting them.
- **Alert marketing on strong reviews:** send a Slack or email message to a marketing channel when the rating is 4 or 5 stars.
- **Confirm success internally:** after the POST, send a short note with the review's result to an internal channel or logging endpoint.

## Notes

- The review endpoint decides how reviewers are matched. This zap sends the reviewer's email, and the endpoint's matching rule applies.
- Anyone with the review endpoint's credentials can create reviews on your product page, so keep those credentials out of shared copies of this file.
- Never commit a real form ID, endpoint URL or product identifier. Replace them with your own values in your copy.
