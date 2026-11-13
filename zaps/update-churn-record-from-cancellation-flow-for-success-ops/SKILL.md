---
name: update-churn-record-from-cancellation-flow-for-success-ops
description: Build a Zap on Zapier that takes a cancellation or retention flow session from a webhook, waits two hours for late edits, then updates the client's row in a churn tracking sheet, or adds one if none exists. Use when a success or retention team keeps churn context in a Google Sheet and wants each cancellation flow's answers and subscription details written there automatically.
license: MIT
metadata:
  author: zapier
  summary: "When a customer finishes a cancellation flow, their row in your churn sheet is updated with the answers and plan details, so success teams see why they left."
  apps: "Webhooks by Zapier, Google Sheets"
  category: "Customer Service & Success"
  job: "Customer success operations"
  source: "https://zapier.com/automations/customer-service-success/customer-success-operations/customer-retention-management/update-churn-record-from-cancellation-flow-for-success-ops"
---

# Update churn record from cancellation flow

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-churn-record-from-cancellation-flow-for-success-ops. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Webhooks by Zapier catch hook (`webhook`, `hook_v2`) receives a flow session from your cancellation endpoint.
2. **Wait:** the Zap waits two hours (`DELAY_SECONDS`) so the member can finish edits to their answers.
3. **Google Sheets** looks up the row whose Client UUID column matches `client_uuid`.
4. **Google Sheets** writes the row. If one exists, it is updated. If none exists, a new row is added. The subscription properties and answers are joined into single cells, and the time is stamped in the Updated at column.

Nothing is processed unless `flow_name` is one of `ALLOWED_FLOW_NAMES`.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting          | What goes there                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| `SPREADSHEET_ID` | The churn sheet. Its ID is the long ID in the sheet's URL, looked up with the user's Google Sheets connection |

Also review the defaults with them: `WORKSHEET_ID` (`"0"` is the first tab), `ALLOWED_FLOW_NAMES` (`cancellation` and `retention`), `DELAY_SECONDS` (`7200`, two hours), and the column letters `CLIENT_UUID_COLUMN` to `UPDATED_AT_COLUMN` (A to E). Confirm the sheet's headers are Client UUID, Flow name, Subscription properties, Cancellation answers and Updated at in those columns, or have them create the missing ones.

Before building, confirm the cancellation endpoint's field names. The code expects `client_uuid`, `flow_name`, `subscription_properties` (a list of strings) and `answers` (a list of `{question, answer}`). If the sender uses other names, change the input schema before installing. A missing `client_uuid` fails the run; other missing fields are written as blanks.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` to the user's Google Sheets connection for the account that owns the churn sheet; it is used for the row lookup and the write. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run these samples as draft test runs before publishing, using a test spreadsheet with the same headers. Use a test client ID that is not yet in the sheet for run 1, such as `[install-test] client-0001`.

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

For the add and update runs, set `DELAY_SECONDS` to 5 for the draft test, then set it back to 7200 before publishing. Confirm that only the matching client's row changed: subscription, answers and updated time are set, and no other row was touched. If run-status tools aren't available, check the result in Google Sheets directly. The user deletes the test rows.

Then publish, confirm the trigger is active, and give the user the webhook URL shown on the trigger (`details.webhook_url`) to point their cancellation endpoint at.

## Notes

- Use `hook_v2`, not Catch Raw Hook: the code reads the parsed JSON fields.
- The Google Sheets lookup returns no rows when nothing matches, so the add path runs without an error.
- Only the first matching row is updated. Clean up duplicate Client UUIDs first.
- Google Sheets may show the timestamp in the sheet's own format and time zone.
- For a shorter wait on priority accounts, set `DELAY_SECONDS` to `1800` (30 minutes), or add a branch that reads the account tier from the payload.
- To have ops triage new clients by hand, add a step after the add path that creates a task in your task app.
- Anyone with the webhook URL can write to the churn sheet. Never commit a real spreadsheet ID or webhook URL.
