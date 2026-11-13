---
name: assign-expert-requests-to-next-specialist-in-rotation
description: Build a Zap on Zapier that routes each new expert request email to the next specialist in a rotation table, labels the message, replies to the thread with the specialist's address, and advances the rotation. Use when a team takes requests by email and wants them handed out in turn, with each handoff logged in a Zapier Table.
license: MIT
metadata:
  author: zapier
  summary: "Each new expert request is routed to the next specialist in your rotation, who gets the reply, and the rotation table moves on so requests are shared out in turn."
  apps: "Gmail, Zapier Tables"
  category: "Business Owners"
  job: "Task management"
  source: "https://zapier.com/automations/business-owners/task-management/task-assignment-routing/assign-expert-requests-to-next-specialist-in-rotation"
---

# Assign expert requests to next specialist in rotation

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/assign-expert-requests-to-next-specialist-in-rotation. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new Gmail message matching the search `subject:"expert request" in:inbox` arrives (`gmail`, `search`).
2. **Filter (in code):** skips replies (subject starts with `Re:`), automated or billing notices (sender or subject contains `noreply`, `billing`, `invoice` or `receipt`), and messages already routed (body contains the hidden marker).
3. **Zapier Tables** finds the record marked Next in the rotation table.
4. **Gmail** adds that record's label to the message.
5. **Gmail** replies in the same thread, addressed to the record's email, with the original message text and a hidden marker so the same request is not routed twice.
6. **Zapier Tables** updates the assignee: Next is cleared and the assigned count goes up by one. It then finds the record with the next rotation order (or the first one, when the assignee is last) and sets it to Next.

If no record is marked Next, the reply goes to the fallback address and the table is left alone. The rotation advances only after the reply is sent.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting             | What goes there                                                             |
| ------------------- | --------------------------------------------------------------------------- |
| `ROTATION_TABLE_ID` | The Zapier Table that holds the expert rotation, with the six columns below |
| `FALLBACK_EMAIL`    | The address that gets a request when no record in the table is marked Next  |

The rotation table needs these columns, in this order, so the field keys match: `f1` Name (text), `f2` Email (email), `f3` Next (checkbox), `f4` Assigned count (number), `f5` Rotation order (number), `f6` Gmail label ID (text). Mark exactly one record as Next.

Also review the default with them: `PROCESSED_MARKER` (`rotation-routed`), unless they already use that marker in their inbox.

Also confirm:

- Which Gmail search finds the expert requests, and does it match the messages they want routed? Set it as the trigger's query. The default is `subject:"expert request" in:inbox`.
- Do the specialists' Gmail labels already exist? Each record needs its label ID in `f6`.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` to the user's Gmail account that receives the requests and sends the replies. Zapier Tables needs no connection; the table lives in the user's Zapier account.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/search.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's Gmail search from the user's answer. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Send a test message to the user's own inbox with the subject `[install-test] expert request: can someone review our API webhook setup` (any body). Then run this sample as a draft test, using that message's own IDs and address:

```json
{
  "message_id": "1900000000000001",
  "thread_id": "1900000000000002",
  "subject": "[install-test] expert request: can someone review our API webhook setup",
  "from": { "email": "requester@example.com" },
  "body_plain": "[install-test] Sample expert request. Please route me to the next expert."
}
```

Use a test rotation table with two records, both pointing at a test address the user owns, one marked Next. Check that:

- The reply appears in the test thread, addressed to the Next record's email, with the original text and the hidden `rotation-routed` marker.
- The test message has the Next record's label.
- The Next record now has Next cleared and its count one higher.
- The record with the next rotation order is now marked Next.

If run-status tools aren't available, check the result in Gmail and the rotation table directly. Ask the user to delete the test messages and tables; the agent doesn't delete them. Then publish, and confirm the trigger is active.

## Notes

- The rotation advances only after the reply is sent. If the reply fails, the table is left unchanged and the run stops, so the same request can be routed again.
- If the assignee is the last record in the order, the next pick wraps to the record with order 1. With a single record, that record stays Next.
- To notify the assigned expert by chat or SMS as well, add a Slack or SMS step after the reply. To open a support ticket instead of replying, add a step that creates one and records its ID back to the table.
- Never commit a real table ID or email address. Anyone who can see the code can see who gets the requests.
