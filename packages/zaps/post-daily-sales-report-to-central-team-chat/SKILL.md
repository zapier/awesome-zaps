---
name: post-daily-sales-report-to-central-team-chat
description: Use when a sales team fills in a daily sales report form and the totals, orders, sellers and diagnostic flags should land in a team chat channel as a readable summary the same day. Good for branch or store teams that report daily and want central visibility without anyone copying numbers by hand.
metadata:
  author: zapier
  summary: "Each daily sales form submission is turned into a short plain-text summary and posted to your team chat channel, so the central team sees the day's numbers right away."
  apps: "Google Forms, Slack"
  category: "Sales"
  job: "Sales reporting"
  source: "https://zapier.com/automations/sales/sales-reporting/sales-performance-tracking/post-daily-sales-report-to-central-team-chat"
---

# Post daily sales report to central team chat

## What it does

1. **Trigger:** a new response arrives on the daily sales report form (Google Forms, New Form Response).
2. **Code step:** the response's fields are read by question title. Missing numbers become `(missing)`, missing text becomes `(not given)`, and the values are laid out as a plain-text summary: branch and date, total sales, order count, sellers and diagnostic flags.
3. **Slack** posts that summary as one message to the team channel. Every submission posts; nothing is deduplicated.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**Trigger:** Google Forms, New Form Response (`google-forms`, action `new_form_response`). Set `formId` to the daily sales report form.

**Connections:**

- `google-forms`: the Google account that owns the sales report form.
- `slack`: the Slack account that can post to the team channel.

**Constants** (top of `workflow.ts`):

- `SLACK_CHANNEL`: the channel ID of the team chat channel the summary goes to.
- `FIELD`: the question titles on the form (`Date`, `Branch`, `Total sales`, `Number of orders`, `Sellers`, `Diagnostic flags`). Match each one to your form's exact wording.
- `LINK_NAMES`: keep `"no"` so the summary never mentions anyone.

**Check the fields first:** with the user's own connections, inspect the trigger's fields and the Slack action's inputs (`get_trigger_fields`, `inspect_zapier_actions`) and make sure the form question titles in `FIELD` match exactly before the first run.

## Ask the user

- Which form is the daily sales report, and what is its form ID?
- What are the exact question titles on the form? Each one goes in `FIELD`.
- Which Slack channel should receive the summary? Use the channel ID.
- Should the summary go to a Slack channel, or does the team use another chat tool? This workflow posts through Slack.

## Test

Submit one test response to the sales report form, or use this sample as the trigger's input:

```json
{
  "Date": "2026-10-29",
  "Branch": "Test Branch",
  "Total sales": "1,250.00",
  "Number of orders": "14",
  "Sellers": "Alex, Sam",
  "Diagnostic flags": "none"
}
```

Check that one message appears in the channel, that it starts with `Daily sales report: Test Branch, 2026-10-29`, and that the total reads `1,250` and orders read `14`. Then remove the test message from the channel if it was not real data.

## Customize

- **Weekday digest email:** send regional managers an aggregated email of the day's submissions.
- **CSV audit log:** add a Formatter step that turns each submission into a CSV row and appends it to a shared worksheet.

## Notes

- The summary is plain text so it displays in any chat tool. Slack is used as the channel, not a generic webhook, so the message is posted by the Slack app.
- Missing numbers show as `(missing)` in the summary; they never stop the post.
- Never commit a real form ID or channel ID to a shared copy of this workflow.
