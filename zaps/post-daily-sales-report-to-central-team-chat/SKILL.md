---
name: post-daily-sales-report-to-central-team-chat
description: Build a Zap on Zapier that turns each daily sales report form submission into a plain-text summary and posts it to a team chat channel, with the totals, orders, sellers and diagnostic flags. Use when a sales team fills in a daily sales report form and the numbers should reach the central team the same day. Good for branch or store teams that report daily and want central visibility without anyone copying numbers by hand.
license: MIT
metadata:
  author: zapier
  summary: "Each daily sales form submission is turned into a short plain-text summary and posted to your team chat channel, so the central team sees the day's numbers right away."
  apps: "Google Forms, Slack"
  category: "Sales"
  job: "Sales reporting"
  source: "https://zapier.com/automations/sales/sales-reporting/sales-performance-tracking/post-daily-sales-report-to-central-team-chat"
---

# Post daily sales report to central team chat

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/post-daily-sales-report-to-central-team-chat. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new response arrives on the daily sales report form (`google-forms`, `new_form_response`).
2. **Code step:** the response's fields are read by question title, and the values are laid out as a plain-text summary: branch and date, total sales, order count, sellers and diagnostic flags.
3. **Slack** posts that summary as one message to the team channel. Every submission posts; nothing is deduplicated.

Missing numbers show as `(missing)` and missing text as `(not given)`; neither stops the post.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve channel names to IDs with the user's Slack connection; don't ask them to paste an ID you can look up.

| Setting         | What goes there                                             |
| --------------- | ----------------------------------------------------------- |
| `SLACK_CHANNEL` | The team chat channel that gets the summary, in `config.ts` |

Also review the defaults with them:

- `FIELD` in `workflow.ts`: the question titles on the form, which must match its exact wording. The defaults are `Date`, `Branch`, `Total sales`, `Number of orders`, `Sellers` and `Diagnostic flags`.
- `LINK_NAMES` in `config.ts`: keep `"no"` so the summary never links or mentions anyone.

Prerequisite questions:

- Which Google Form is the daily sales report? Its form ID goes in the trigger's `formId`.
- Should the summary go to a Slack channel, or does the team use another chat tool? This workflow posts through Slack.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` to the user's Slack connection that can post to the team channel, and `google-forms` to the Google connection that owns the sales report form. The trigger uses `google-forms`.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-form-response.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, with the form's ID as the trigger's `formId`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with the channel set to one the user controls, using this sample as the trigger's input:

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

Check that one message appears in the channel, that it starts with `Daily sales report: Test Branch, 2026-10-29`, and that the total reads `1,250` and orders read `14`. If run-status tools aren't available, check the result in Slack directly. Then publish, confirm the trigger is active, and ask the user to delete the test message; the agent doesn't delete test data.

## Notes

- The summary is plain text so it displays in any chat tool. It is posted through the Slack app, not a generic webhook.
- To send regional managers a weekday digest email of the day's submissions, or to append each submission as a CSV row to a shared worksheet, add a step after the post.
- Never commit a real form ID or channel ID to a shared copy of this workflow.
