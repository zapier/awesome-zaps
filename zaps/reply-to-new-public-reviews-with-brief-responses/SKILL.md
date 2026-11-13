---
name: reply-to-new-public-reviews-with-brief-responses
description: Build a Zap on Zapier that posts a short, friendly public reply to each new Google Business Profile review. Use when a local business wants every new review answered quickly with a templated thank-you, without writing each reply by hand.
license: MIT
metadata:
  author: zapier
  summary: "Each new Google review gets a short, friendly public reply posted under it, so reviewers hear back without you writing every response."
  apps: "Google Business Profile"
  category: "Marketing"
  job: "Review reputation management"
  source: "https://zapier.com/automations/marketing/review-reputation-management/review-response-management/reply-to-new-public-reviews-with-brief-responses"
---

# Reply to new public reviews with brief responses

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/reply-to-new-public-reviews-with-brief-responses. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new review on the watched location in Google Business Profile (`google-business-profile`, `new_review_v3`). The trigger brings the review's name, ID, comment, star rating and reviewer display name.
2. **Code** builds a short reply from a fixed template, addressed to the reviewer's first name (or "there" if no name is given).
3. **Google Business Profile** posts the reply under the review.

The reply is public, so keep the template short and on-brand. Google's content policy applies.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting               | Where                                       | What goes there                                                |
| --------------------- | ------------------------------------------- | -------------------------------------------------------------- |
| `REPLACE_LOCATION_ID` | `triggers/new-review.ts`, `params.location` | The Google Business Profile location whose reviews get replies |

Confirm the Google account to connect manages that location. It is the account bound to `google-business-profile` in step 1 of Build it.

Also review the defaults with them:

- `REPLY_TEMPLATE` in `workflow.ts`: the public reply text. `{name}` becomes the reviewer's first name. Check it reads right before publishing.
- `NAME_FALLBACK` in `config.ts`: `"there"`, used when the reviewer has no display name.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-business-profile` to the user's Google Business Profile connection for the account that manages the location. No other app needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-review.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's `location` from the user's answer. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connection and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a sample review on a location the user controls, since the reply is public:

```json
{
  "id": "REVIEW_ID",
  "name": "accounts/ACCOUNT_ID/locations/LOCATION_ID/reviews/REVIEW_ID",
  "comment": "Great service, thanks!",
  "starRating": "FIVE",
  "reviewer__displayName": "Sam Lee"
}
```

Check that the review shows a reply starting "Hi Sam," in Google Business Profile, and that the run's output has `reply` and `updated` set. If run-status tools aren't available, check the review in Google Business Profile directly. Ask the user to delete the test reply; the agent doesn't delete test data. Then publish, confirm the trigger is active, and leave it on only once the test has passed.

## Notes

- The reply is public and visible to everyone on Google. Test on a location the user controls.
- Posting a reply replaces any reply already on the review. The trigger fires only on new reviews, so this is rare, but a re-delivered review gets the template again.
- Reviewers' names come from Google. The workflow uses only the first word of the display name.
- Not built, and worth adding for some brands: a low-rating branch that alerts a person instead of auto-replying, and a different `REPLY_TEMPLATE` per location for multi-site brands.
