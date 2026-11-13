---
name: google-review-reply-draft
description: Build a Zap on Zapier that drafts a reply to every new Google (or Yelp, Facebook, any site) review in the owner's voice and emails it to the owner to approve, texts the owner on 1 or 2 stars, and logs 5-star reviews to a Testimonial Tuesday sheet. Use when a business owner wants help replying to reviews without auto-posting anything.
license: MIT
metadata:
  author: andrewckor
  summary: "Every new review gets a reply drafted in your voice and emailed to you to approve. 1 and 2 stars text you right away. 5 stars land in a testimonials sheet."
  apps: "Google Business Profile, Webhooks by Zapier, AI by Zapier, SMS by Zapier, Gmail, Google Sheets"
  category: "Marketing"
  job: "Reputation management"
---

# Google review reply draft

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/google-review-reply-draft. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** Google Business Profile **New Review**, or a Webhooks by Zapier **Catch Hook** that any other review site, form, or scraper can POST to (or both). The code handles both payload shapes, including messy field names.
2. **AI by Zapier** reads the review and returns the reviewer (first name, last initial), stars, source, review text, link, a pull quote, a short SMS alert, and a **reply draft**: 2 to 4 sentences in the owner's voice that references one specific detail from the review. No "Thank you for your review" openers, no emojis.
3. **1 or 2 stars:** SMS by Zapier texts the owner right away with the short alert.
4. **Gmail** emails the owner the review and the draft.
5. **5 stars:** Google Sheets adds a row to **Testimonial Tuesday** (date, reviewer, stars, source, pull quote, full review, reply draft, link).

Nothing is posted publicly. The owner edits the draft and posts it on the review; that email is the approval step.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                        | What goes there                                                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_OWNER_EMAIL`          | The email address that gets the reply drafts                                                                               |
| `REPLACE_TESTIMONIAL_SHEET_ID` | The Testimonial Tuesday spreadsheet. Look it up with the user's Google Sheets connection; 5-star runs fail until it is set |

Also review the defaults with them: `OWNER_VOICE` in `config.ts` (rewrite it from how they sound, e.g. "Brad, owner. Casual, thanks people by name, mentions the tech.") and `TESTIMONIAL_WORKSHEET_ID` (`"0"` is the first tab; change it only if they pick another).

Ask these before building:

- Where do reviews come from: Google only, or other sites too? Google needs the Google Business Profile trigger and its location; other sites use the catch hook.
- Is there already a Testimonial Tuesday sheet? If not, create one with the headers `Date, Reviewer, Stars, Source, Pull quote, Full review, Reply draft, Review link`, then look up its ID.
- Which phone gets the 1 and 2 star alerts? Set it as the verified number in the SMS by Zapier connection, not in the code.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` (the account that sends the draft email), `sms` (SMS by Zapier, the owner's verified number) and `google-sheets` (the account that owns the Testimonial Tuesday sheet) to the user's connections. On the Google path, the Google Business Profile connection is the trigger's authentication. AI by Zapier and the catch hook need no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. Set the workflow's trigger and connection bindings from the answers above: on the Google path, Google Business Profile **New Review** (`google-business-profile`, `new_review_v3`, with `location` set to the user's location); for other sites, Webhooks by Zapier **Catch Hook** (`webhook`, `hook_v2`, no connection, so `authentication_id` is `null`). Both can run in one workflow. If your tools take only one trigger per workflow, publish the same `workflow.ts` once per trigger and name the copies so the user can tell them apart. For each trigger's `selected_api`, call `search_triggers` with the app slug, find the row whose `key` is the trigger's event, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections, and sample the trigger on the Google path, before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run these two sample payloads as draft test runs. They are made up, and field names are messy on purpose:

```json
{
  "Reviewer Name": "Dana Kowalski",
  "rating": "5/5",
  "platform": "google",
  "review_body": "AC died during the heat wave and Marcus was at our house within two hours. He showed me the burnt capacitor, explained the options without upselling, and had it running before dinner. Fair price too.",
  "review url": "https://g.page/r/example-review"
}
```

```json
{
  "user": "Sam T.",
  "Stars Given": "1",
  "site": "Yelp",
  "txt": "booked a tune-up for 9am, nobody showed til almost noon and no one called. tech was nice but i took the morning off work for this"
}
```

Expect two draft emails, one text (for the 1-star review), and one new row in Testimonial Tuesday (for the 5-star review). If run-status tools aren't available, check the result in Gmail, the phone and Google Sheets directly. The user deletes the test data, not the agent.

On the Google path, also test with a real review: with the Google Business Profile connection active and the right location picked, pull the location's latest review with the trigger's test or "find new records". If the location has no reviews yet, have a teammate leave one. Run the workflow on it and check that the AI reads Google's star format (`FIVE`, `ONE`), the reviewer name and the comment, and that the draft email, the text (1 or 2 stars) or the sheet row (5 stars) arrives. Call it done only when this real run passes.

## Notes

- Nothing is ever posted publicly by this Zap. The owner approves every reply by posting it.
- SMS by Zapier texts only the verified owner number and truncates past 153 characters; the alert is kept under 150.
- To tune it: `OWNER_VOICE` and the reply rules in the AI instructions, the 1 or 2 star alert threshold (`isLow`), and the 5-star testimonial rule (`stars === 5`).
- Google Business Profile also has a Create Reply action. Add it only behind a real approval step; this skill never posts unreviewed.
- Never commit a real webhook URL, email address, phone number, or sheet ID.
