---
name: assign-expert-requests-to-next-specialist-in-rotation
description: Build a Zapier Next Gen Zap that routes each new expert request email to the next specialist in a rotation table, labels the message, replies to the thread with the specialist's address, and advances the rotation. Use when a team takes requests by email and wants them handed out in turn, with each handoff logged in a Zapier Table.
metadata:
  author: zapier
  summary: "Each new expert request is routed to the next specialist in your rotation, who gets the reply, and the rotation table moves on so requests are shared out in turn."
  apps: "Gmail, Zapier Tables"
  category: "Business Owners"
  job: "Task management"
  source: "https://zapier.com/automations/business-owners/task-management/task-assignment-routing/assign-expert-requests-to-next-specialist-in-rotation"
---

# Assign expert requests to next specialist in rotation

## What it does

1. **Trigger:** a new Gmail message matching the search `subject:"expert request" in:inbox` arrives.
2. **Filter (in code):** skips replies (subject starts with `Re:`), automated or billing notices (sender or subject contains `noreply`, `billing`, `invoice` or `receipt`), and messages already routed (body contains the hidden marker).
3. **Zapier Tables** finds the record marked Next in the rotation table.
4. **Gmail** adds that record's label to the message.
5. **Gmail** replies in the same thread, addressed to the record's email, with the original message text and a hidden marker so the same request is not routed twice.
6. **Zapier Tables** updates the assignee: Next is cleared and the assigned count goes up by one. It then finds the record with the next rotation order (or the first one, when the assignee is last) and sets it to Next.

If no record is marked Next, the reply goes to the fallback address and the table is left alone.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Gmail, New Email Matching Search (`gmail`, action `search`). Set its `query` to the search that matches expert requests in your inbox, for example `subject:"expert request" in:inbox`. The trigger takes no connection id in the code; bind it to your Gmail connection when you set the trigger.
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the Gmail account that receives the requests and sends the replies.
   - Zapier Tables (`zapier-tables`) needs no connection. The table lives in your Zapier account.
3. **Table:** create a Zapier Table with these six columns, in this order, so the field keys match: `f1` Name (text), `f2` Email (email), `f3` Next (checkbox), `f4` Assigned count (number), `f5` Rotation order (number), `f6` Gmail label ID (text). Add one record per specialist and mark exactly one as Next. Each label ID is a Gmail label the specialist's requests get.
4. **Constants:**
   - `ROTATION_TABLE_ID`: the ID of the rotation table.
   - `FALLBACK_EMAIL`: the address that gets the request when no record is marked Next.
   - `PROCESSED_MARKER`: leave as `rotation-routed` unless you have another marker in your inbox.
5. Test with the steps below, then publish, wait until the trigger is active, and tell the user the trigger is live.

## Ask the user

- Which Gmail search finds the expert requests, and does it match the messages you want routed? The default is `subject:"expert request" in:inbox`.
- Which Zapier Table is the rotation, and which columns hold the email, next flag, count, order and label ID? The code expects the six columns above.
- Who gets the request when nobody is marked Next?
- Do the specialists' Gmail labels already exist? Each record needs its label ID.

## Test

Send yourself a message with the subject `[install-test] expert request: can someone review our API webhook setup` (any body), then run this sample as a draft test (`run_workflow_draft` in Zapier MCP) before publishing. Use the message's own IDs:

```json
{
  "message_id": "YOUR_TEST_MESSAGE_ID",
  "thread_id": "YOUR_TEST_THREAD_ID",
  "subject": "[install-test] expert request: can someone review our API webhook setup",
  "from": { "email": "YOUR_TEST_ADDRESS" },
  "body_plain": "[install-test] Sample expert request. Please route me to the next expert."
}
```

Use a test rotation table with two records, both pointing at a test address you own, one marked Next. Confirm:

- The reply appears in the test thread, addressed to the Next record's email, with the original text and the hidden `rotation-routed` marker.
- The test message has the Next record's label.
- The Next record now has Next cleared and its count one higher.
- The record with the next rotation order is now marked Next.

Then delete the test messages and tables, or tell the user to.

## Customize

- **Notify the assigned expert** by chat or SMS instead of only emailing them: add a Slack or SMS step after the reply.
- **Create a ticket** in your support system instead of replying, and record the ticket ID back to the table.

## Notes

- The rotation advances only after the reply is sent. If the reply fails, the table is left unchanged and the run stops, so the same request can be routed again.
- If the assignee is the last record in the order, the next pick wraps to the record with order 1. With a single record, that record stays Next.
- Never commit a real table ID or email address. Anyone who can see the code can see who gets your requests.
