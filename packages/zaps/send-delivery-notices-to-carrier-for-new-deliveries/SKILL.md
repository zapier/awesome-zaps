---
name: send-delivery-notices-to-carrier-for-new-deliveries
description: Build a Zapier Next Gen Zap that emails the carrier a clear notice for each delivery event (new pickup, weight update or cancellation) received by webhook. Use when a dispatch or delivery system can POST delivery events and carriers need consistent, timely instructions by email.
metadata:
  author: zapier
  summary: "When a delivery event comes in, the carrier gets an email with the pickup date, location, address, recipient, delivery window and weight, so dispatch doesn't have to send each one by hand."
  apps: "Webhooks by Zapier, Gmail"
  category: "Business Owners"
  job: "Logistics management"
  source: "https://zapier.com/automations/business-owners/logistics-management/delivery-scheduling/send-delivery-notices-to-carrier-for-new-deliveries"
---

# Send delivery notices to carrier for new deliveries

## What it does

1. **Trigger:** a delivery event arrives at a Webhooks by Zapier catch hook (the delivery system POSTs JSON to it).
2. **Filter:** events flagged `customer_excluded` are skipped, and so are notice types other than `new_pickup`, `weight_update` and `cancellation`.
3. **Gmail** sends one plain-text email to the carrier. The subject is `New pickup - <delivery_id>`, `Weight update - <delivery_id>` or `Cancelled delivery - <delivery_id>`. The body lists the pickup date, pickup location, delivery address, recipient, phone, delivery window and total weight. Missing fields read "not given".

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`, version 1.2.0). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the Gmail account that sends the notices.
3. **Constants:**
   - `CARRIER_EMAIL`: the carrier's inbox. Replace `YOUR_EMAIL_ADDRESS`.
   - `SKIP_EXCLUDED_CUSTOMERS`: `true` skips events where the payload's `customer_excluded` is true. Set `false` to send them anyway.
   - `NOTICE_PREFIXES`: the subject prefix for each `notice_type`. Rename the prefixes here if the carrier expects other wording.
4. Test with the sample below, then publish, wait until the trigger is active, and give the user their webhook URL to point the delivery system at.

## Ask the user

- Which carrier inbox should receive the notices? That is `CARRIER_EMAIL`.
- Which fields does the delivery system send, and under what names? The code expects `delivery_id`, `notice_type`, `customer_excluded`, `pickup_date`, `pickup_location`, `delivery_address`, `recipient_name`, `recipient_phone`, `delivery_window` and `total_weight`. Rename them in the code if the sender uses other names.
- Should the originator be copied on each notice? The Gmail connection can only send to its own address during testing, so the copy is not built; add a CC once the address is known.
- Do the excluded or test customers come as a flag in the payload? If not, add the check that matches the sender's data.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use test data only, with names prefixed `[install-test]`:

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

Check that the run completes, that one email arrives at `CARRIER_EMAIL` with subject `New pickup - [install-test] DEL-1001`, and that its body shows each field from the sample. Then delete the test email if it was real data.

## Customize

- **Alert on cancellations:** post a Slack or team channel message when `notice_type` is `cancellation`, so the change is visible straight away.
- **High-weight pickup task:** when `total_weight` is over a threshold, also create a pickup task in your task tracker.

## Notes

- Each webhook event sends one email. Nothing matches an event to an earlier notice, so a repeated event sends a repeated notice. Add a lookup on `delivery_id` in your tracker first if repeats are a problem.
- The notices are plain text. Gmail may show the pickup time in the sender's time zone, not the carrier's.
- Never commit a real carrier address or webhook URL. Anyone with the webhook URL can send carrier notices.
