---
name: update-churn-record-from-cancellation-flow-for-success-ops
description: Build a Zapier Next Gen Zap that takes a cancellation or retention flow session from a webhook, waits two hours for late edits, then updates the client's row in a churn tracking sheet, or adds one if none exists. Use when a success or retention team keeps churn context in a Google Sheet and wants each cancellation flow's answers and subscription details written there automatically.
metadata:
  author: zapier
  summary: "When a customer finishes a cancellation flow, their row in your churn sheet is updated with the answers and plan details, so success teams see why they left."
  apps: "Webhooks by Zapier, Google Sheets"
  category: "Customer Service & Success"
  job: "Customer success operations"
  source: "https://zapier.com/automations/customer-service-success/customer-success-operations/customer-retention-management/update-churn-record-from-cancellation-flow-for-success-ops"
---

# Update churn record from cancellation flow

## What it does

1. **Trigger:** a flow session is posted to a Webhooks by Zapier catch hook from your cancellation endpoint. Nothing is processed unless `flow_name` is one of the configured flow names.
2. **Wait:** the workflow waits two hours (`DELAY_SECONDS`) so the member can finish edits to their answers.
3. **Google Sheets** looks up the row whose Client UUID column matches `client_uuid`.
4. **Google Sheets** writes the row. If one exists, it is updated. If none exists, a new row is added. The subscription properties and answers are joined into single cells, and the time is stamped in the Updated at column.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`, version `1.2.0`). It needs no connection, so its `authentication_id` is `null` and `params` is `{}`. Use `hook_v2`, not Catch Raw Hook, because the code reads the parsed JSON fields.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the Google Sheets connection for the account that owns the churn sheet.
3. **Constants** (at the top of `workflow.ts`):
   - `SPREADSHEET_ID`: the long ID in the churn sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `ALLOWED_FLOW_NAMES`: the flow names that count as cancellation or retention. Defaults to `["cancellation", "retention"]`.
   - `DELAY_SECONDS`: the wait before the write. Defaults to `7200` (two hours). Set it to `1800` for the 30-minute variant in Customize.
   - `CLIENT_UUID_COLUMN`, `FLOW_NAME_COLUMN`, `SUBSCRIPTION_COLUMN`, `ANSWERS_COLUMN`, `UPDATED_AT_COLUMN`: column keys such as `COL$A`, not header names. Map the sheet's headers to their column letters. The columns used in the test were A to E, with the headers Client UUID, Flow name, Subscription properties, Cancellation answers and Updated at.
4. Test with the sample below, then publish, wait until the trigger is active, and give the user the webhook URL shown on the trigger (`details.webhook_url`) to point their cancellation endpoint at.

## Ask the user

- Which sheet and tab is the churn repository? Which columns hold the Client UUID, subscription properties, answers and updated time? Create the columns if they are missing.
- What exact field names does the cancellation endpoint send? The code expects `client_uuid`, `flow_name`, `subscription_properties` (a list of strings) and `answers` (a list of `{question, answer}`). If the sender uses other names, change the input schema before installing. A missing `client_uuid` fails the run; other missing fields are written as blanks.
- Which flow names count? The default is `cancellation` and `retention`.
- Is a two-hour wait right for every account? The Customize section lists a shorter wait for high-priority accounts.

## Test

Run these samples as draft test runs (`run_workflow_draft` in Zapier MCP) before publishing, using a test spreadsheet with the same headers. Use a client ID that is not yet in the sheet for run 1. The tested sample used `[install-test] client-0001`; replace it with your own test ID.

Run 1 (add path):

```json
{
  "client_uuid": "[install-test] client-0001",
  "flow_name": "cancellation",
  "subscription_properties": ["Plan: Pro", "Billing: monthly"],
  "answers": [
    { "question": "Why are you cancelling?", "answer": "Too expensive" },
    { "question": "Anything we could fix?", "answer": "Pricing tier" }
  ]
}
```

Run 2 (update path): send the same `client_uuid` with `flow_name` set to `retention`, `subscription_properties` set to `["Plan: Pro", "Billing: annual"]`, and one answer, `{"question": "Why are you cancelling?", "answer": "Switching tools"}`. Confirm there is still one row for that client, with the new values.

Run 3 (skip path): send a `flow_name` that is not in `ALLOWED_FLOW_NAMES`, such as `onboarding`. Confirm the run returns `skipped` and writes nothing.

For the add and update runs, reduce `DELAY_SECONDS` to 5 for the draft test, then set it back to 7200 before publishing. Confirm that only the matching client's row changed: subscription, answers and updated time are set, and no other row was touched. Then tell the user to delete any test rows.

## Customize

- **Shorter wait for priority accounts:** set `DELAY_SECONDS` to `1800` (30 minutes), or add a branch that reads the account tier from the payload.
- **Support task when no row exists:** when `existing` is empty, add a step that creates a task in the user's task app so ops can triage the new client by hand.

## Notes

- The Google Sheets lookup returns no rows when nothing matches, so the add path is taken without an error.
- Only the first matching row is updated. If the sheet has duplicate Client UUIDs, clean them up first.
- Google Sheets may show the timestamp in the sheet's own format and time zone.
- Never commit a real spreadsheet ID or webhook URL. Anyone with the webhook URL can write to the churn sheet.
