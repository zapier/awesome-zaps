---
name: google-review-reply-draft
description: Build a Zapier Next Gen Zap that drafts a reply to every new Google (or Yelp, Facebook, any site) review in the owner's voice and emails it to the owner to approve, texts the owner on 1 or 2 stars, and logs 5-star reviews to a Testimonial Tuesday sheet. Use when a business owner wants help replying to reviews without auto-posting anything.
metadata:
  author: andrewckor
  summary: "Every new review gets a reply drafted in your voice and emailed to you to approve. 1 and 2 stars text you right away. 5 stars land in a testimonials sheet."
  apps: "Google Business Profile, Webhooks by Zapier, AI by Zapier, SMS by Zapier, Gmail, Google Sheets"
  category: "Marketing"
  job: "Reputation management"
---

# Google review reply draft

## What it does

1. **Trigger:** Google Business Profile **New Review**, or a Webhooks by Zapier **Catch Hook** that any other review site, form, or scraper can POST to (or both). The code handles both payload shapes, including messy field names.
2. **AI by Zapier** reads the review and returns the reviewer (first name, last initial), stars, source, review text, link, a pull quote, a short SMS alert, and a **reply draft**: 2 to 4 sentences in the owner's voice that references one specific detail from the review. No "Thank you for your review" openers, no emojis.
3. **1 or 2 stars:** SMS by Zapier texts the owner right away, e.g.
   ```
   1-star Yelp review from Sam T.: 9am tune-up arrived near noon, no call; took the morning off work.
   ```
4. **Gmail** emails the owner the review and the draft. **Nothing is posted publicly.** The owner edits it and posts it on the review. That email is the approval step.
5. **5 stars:** Google Sheets adds a row to **Testimonial Tuesday** (date, reviewer, stars, source, pull quote, full review, reply draft, link).

Sample email for a 5-star review:

```
Subject: ★★★★★ Dana K. on Google: reply draft ready

"AC died during the heat wave and Marcus was at our house within two hours. He showed me the burnt capacitor ... Fair price too."

Suggested reply (edit it, then post it on the review):

Dana, I'm glad Marcus could get there within two hours and show you the burnt capacitor before laying out the options. Thanks for trusting us to get the AC running before dinner, and I'm happy the price felt fair. Hope you stay cool.
```

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names. Without Zapier MCP, the Zapier SDK CLI works too (`npx skills add zapier/agent-skills --skill workflows-create`).

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Triggers:** pick by where reviews come from. The code handles both payload shapes.
   - **Google reviews:** Google Business Profile **New Review** (`google-business-profile`, `new_review_v3`, param `location`), authenticated with the user's Google Business Profile connection.
   - **Any other review site:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). No connection, so `authentication_id` is `null`.
   - **Both:** If the user wants more than one trigger, add them all to the one workflow when your tools allow it (Next Gen Zaps support several triggers). If your tools take only one trigger per workflow, as Zapier MCP's `update_workflow_draft` does today, install the same `workflow.ts` once per trigger and name the copies so the user can tell them apart.
2. **Connections** (each alias in the code is the app's slug):
   - `google-business-profile`: the user's Google Business Profile account. This is the **trigger's** authentication, so it is not in the code. Required on the Google path.
   - `gmail`: the Gmail account that sends the draft email.
   - `sms`: SMS by Zapier (the owner's verified number).
   - `google-sheets`: the Google Sheets account that owns the Testimonial Tuesday sheet.
   - AI by Zapier needs no connection. `authentication_id: "0"` in the code means Zapier's managed AI credentials; leave it as is.
3. **Sheet:** create it if it doesn't exist: a spreadsheet named **Testimonial Tuesday** with headers `Date, Reviewer, Stars, Source, Pull quote, Full review, Reply draft, Review link` (Google Sheets "Create Spreadsheet" works).
4. **Constants** at the top of `workflow.ts`:
   - `OWNER_EMAIL`: where the drafts go. The workflow refuses to run while it is still `you@example.com`.
   - `OWNER_VOICE`: how the owner sounds.
   - `TESTIMONIAL_SHEET_ID`: the sheet's ID. 5-star runs fail while it is still `YOUR_SPREADSHEET_ID`.
   - `TESTIMONIAL_WORKSHEET_ID`: the tab inside the sheet. `"0"` is the first tab; change it only if the user picks another.
5. Test with the payloads below, then publish. If using the catch hook, wait until the trigger is active and give the user their webhook URL.

## Ask the user

- Which email should get the reply drafts? (`OWNER_EMAIL`)
- How do you sound when you reply? (edit `OWNER_VOICE`, e.g. "Brad, owner. Casual, thanks people by name, mentions the tech.")
- Where do reviews come from: Google only, or other sites too?
- Which phone gets 1 and 2 star alerts? (Set it in the SMS by Zapier connection, not in the code.)
- Is there already a testimonials sheet, or should you create one? (`TESTIMONIAL_SHEET_ID`)
- On the Google path: which Business Profile location? (the trigger's `location` param)

## Test

### 1. Webhook samples

Run each sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Posting it to the webhook URL only works once the workflow is published.

Run these two samples (field names messy on purpose):

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

Expect: two draft emails, one text (for the 1-star), one new row in Testimonial Tuesday (for the 5-star).

### 2. Real test from Google Business Profile

Webhook samples prove the logic, not the Google trigger. If the user uses Google Business Profile, also test it for real:

1. Make sure the Google Business Profile connection is active (reconnect it if the login expired) and pick the right `location`.
2. Use the trigger's test / "find new records" to pull the location's latest real review. If the location has no reviews yet, ask a friend or teammate to leave a test review and pull it.
3. Run the workflow on that real review and check each step: the AI parses Google's star format (`FIVE`, `ONE`), the reviewer name and the comment; the draft email arrives; a 1 or 2 star review texts the owner; a 5 star review adds a sheet row.
4. Only call it done when this real run passes.

## Customize

- **Voice:** `OWNER_VOICE`, plus the reply rules in the AI `instructions`
- **Alert threshold:** `isLow` (default 1 or 2 stars)
- **Testimonial rule:** `stars === 5` (lower it to 4 if you like)
- **Auto-post for Google:** Google Business Profile has a **Create Reply** action (`create_reply`, needs `review_name` from the trigger's `name`). Only add it behind a real approval step; this skill never posts unreviewed.

## Notes

- Nothing is ever posted publicly by this Zap. The owner approves every reply by posting it.
- SMS by Zapier texts only the verified owner number and truncates past 153 characters; the alert is kept under 150.
- Never commit a real webhook URL, email address, phone number, or sheet ID.
