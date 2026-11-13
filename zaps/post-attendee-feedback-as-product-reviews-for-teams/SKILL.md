---
name: post-attendee-feedback-as-product-reviews-for-teams
description: Build a Zap on Zapier that posts each attendee feedback submission from a Typeform form to your review platform as a product review, so marketing and product teams get timely, publishable endorsements. Use when event or program attendees fill in a Typeform survey and the feedback should become reviews on a product page or review API without manual copying.
license: MIT
metadata:
  author: zapier
  summary: "Each attendee feedback form submission with a rating or review text is posted to your review platform, so good feedback becomes a publishable review without manual copying."
  apps: "Typeform, Webhooks by Zapier"
  category: "Product"
  job: "Product feedback management"
  source: "https://zapier.com/automations/product/product-feedback-management/user-feedback-collection/post-attendee-feedback-as-product-reviews-for-teams"
---

# Post attendee feedback as product reviews for teams

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/post-attendee-feedback-as-product-reviews-for-teams. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Typeform form is submitted (`typeform`, `entries_resthook_v2`, for the form you choose).
2. **Filter:** if the submission has neither a rating nor review text, the run stops and posts nothing.
3. **Webhooks by Zapier** (`webhook`) sends a JSON POST to your review platform's endpoint with the product identifier, the reviewer's name and email, and the review title, body and rating. The endpoint matches reviewers by email and creates a new review record for each qualifying submission.

The Zap posts only submissions with a rating or review text, and only to the endpoint you set.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting               | Where                                    | What goes there                                                                                            |
| --------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `REPLACE_FORM_ID`     | `triggers/entries-resthook.ts`, `params` | The Typeform form that collects attendee feedback                                                          |
| `TITLE_FIELD`         | `config.ts`                              | The field key of the form question that holds the review title, from the chosen form's fields              |
| `BODY_FIELD`          | `config.ts`                              | The field key of the question that holds the review text                                                   |
| `RATING_FIELD`        | `config.ts`                              | The field key of the star rating question                                                                  |
| `NAME_FIELD`          | `config.ts`                              | The field key of the question that holds the reviewer's name                                               |
| `EMAIL_FIELD`         | `config.ts`                              | The field key of the question that holds the reviewer's email. The review endpoint matches reviewers on it |
| `REVIEW_ENDPOINT_URL` | `config.ts`                              | The POST URL of the review platform's endpoint that accepts new reviews                                    |
| `PRODUCT_ID`          | `config.ts`                              | The identifier the review platform uses for this product, sent with every review                           |

Also review with them: the JSON keys `workflow.ts` sends to the endpoint (`product_id`, `reviewer_name`, `customer_email`, `title`, `body`, `rating`). If the endpoint expects other names, change them in the `data` object before publishing.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `typeform` (the alias the trigger in `triggers/` uses) to the user's Typeform connection, for reading the chosen form's entries. Webhooks by Zapier (`webhook`) needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/entries-resthook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, using a submission that has a rating and text. The keys are the form field keys set in `config.ts`; this sample uses made-up keys, so swap in the user's:

```json
{
  "title": "Great follow-up after the workshop",
  "body": "The onboarding session answered every question I had.",
  "rating": 5,
  "name": "Sample Attendee",
  "email": "attendee@example.com"
}
```

Check that the review platform received one POST with the product identifier, the reviewer's name and email, and the title, body and rating. Then run a second sample with no rating and no text: the run should stop at the filter and send nothing. If run-status tools aren't available, check the result in the review platform directly. The user deletes the test review there, not the agent.

## Notes

- The review endpoint decides how reviewers are matched. This Zap sends the reviewer's email, and the endpoint's matching rule applies.
- Anyone with the endpoint's credentials can create reviews on your product page, so keep those credentials out of shared copies of this file.
- Never commit a real form ID, endpoint URL or product identifier.
- To extend it: queue reviews below a rating threshold for approval, alert marketing on 4 or 5 star reviews, or log each POST's result to an internal channel.
