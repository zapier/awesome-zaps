---
name: send-delivery-notices-to-carrier-for-new-deliveries
description: Build a Zap on Zapier that emails the carrier a clear notice for each delivery event (new pickup, weight update or cancellation) received by webhook. Use when a dispatch or delivery system can POST delivery events and carriers need consistent, timely instructions by email.
license: MIT
metadata:
  author: zapier
  summary: "When a delivery event comes in, the carrier gets an email with the pickup date, location, address, recipient, delivery window and weight, so dispatch doesn't have to send each one by hand."
  apps: "Webhooks by Zapier, Gmail"
  category: "Business Owners"
  job: "Logistics management"
  source: "https://zapier.com/automations/business-owners/logistics-management/delivery-scheduling/send-delivery-notices-to-carrier-for-new-deliveries"
---

# Send delivery notices to carrier for new deliveries

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-delivery-notices-to-carrier-for-new-deliveries. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** the delivery system POSTs a delivery event as JSON to a catch hook (`webhook`, `hook_v2`).
2. **Filter:** events flagged `customer_excluded` are skipped, and so are notice types other than `new_pickup`, `weight_update` and `cancellation`.
3. **Gmail** sends one plain-text email to the carrier. The subject is `New pickup - <delivery_id>`, `Weight update - <delivery_id>` or `Cancelled delivery - <delivery_id>`. The body lists the pickup date, pickup location, delivery address, recipient, phone, delivery window and total weight. Missing fields read "not given".

The Zap only emails the carrier. It never changes the delivery or contacts the customer.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting         | What goes there                                             |
| --------------- | ----------------------------------------------------------- |
| `CARRIER_EMAIL` | The carrier's inbox, the address that receives every notice |

Also review the defaults with them: `SKIP_EXCLUDED_CUSTOMERS` (`true` skips events where the payload's `customer_excluded` is true; `false` sends them anyway) and `NOTICE_PREFIXES` (the subject prefix for each `notice_type`; rename them if the carrier expects other wording).

Confirm these with them too:

- Which fields does the delivery system send, and under what names? The code expects `delivery_id`, `notice_type`, `customer_excluded`, `pickup_date`, `pickup_location`, `delivery_address`, `recipient_name`, `recipient_phone`, `delivery_window` and `total_weight`. Rename them in the code if the sender uses other names.
- Do excluded or test customers come as a `customer_excluded` flag in the payload? If not, add the check that matches the sender's data.
- Should the originator be copied on each notice? The Gmail connection can only send to its own address during testing, so the copy is not built; add a CC once the address is known.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` to the user's Gmail connection, the account that sends the notices. The webhook trigger needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with `CARRIER_EMAIL` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the Gmail action's fields with the user's connection before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test run (`run_workflow_draft` in Zapier MCP) with test data only, with names prefixed `[install-test]`:

```json
{
  "delivery_id": "[install-test] DEL-1001",
  "notice_type": "new_pickup",
  "customer_excluded": false,
  "pickup_date": "2026-11-02",
  "pickup_location": "[install-test] Warehouse 3, 100 Dock Rd",
  "delivery_address": "[install-test] 21 Test Ave, New York, NY",
  "recipient_name": "[install-test] Test Recipient",
  "recipient_phone": "+1 555 0100",
  "delivery_window": "09:00-12:00",
  "total_weight": "42 kg"
}
```

Check that the run completes, that one email arrives at `CARRIER_EMAIL` with subject `New pickup - [install-test] DEL-1001`, and that its body shows each field from the sample. If run-status tools aren't available, check the result in Gmail directly. Ask the user to delete the test email; the agent doesn't delete it. Then publish, confirm the trigger is active, and give the user their webhook URL to point the delivery system at.

## Notes

- Each webhook event sends one email, and nothing matches an event to an earlier notice, so a repeated event sends a repeated notice. Add a lookup on `delivery_id` in your tracker first if repeats are a problem.
- The notices are plain text. Gmail may show the pickup time in the sender's time zone, not the carrier's.
- To alert on cancellations, post a Slack or team channel message when `notice_type` is `cancellation`. For a high-weight pickup, create a pickup task in your task tracker when `total_weight` is over a threshold.
- Never commit a real carrier address or webhook URL. Anyone with the webhook URL can send carrier notices.
