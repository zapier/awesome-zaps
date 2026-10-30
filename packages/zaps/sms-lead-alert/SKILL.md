---
name: sms-lead-alert
description: Build a Zapier Next Gen Zap that texts the business owner every new lead (name, phone, need, and a suggested reply). Use when someone wants instant lead alerts by SMS from a website form, webhook, or Facebook Lead Ads.
metadata:
  author: andrewckor
  summary: "Texts you every new lead the moment it comes in: their name, number, what they need, and a reply you can send back."
  apps: "Webhooks by Zapier, AI by Zapier, SMS by Zapier, Facebook Lead Ads (optional)"
  category: "Sales"
  job: "Lead management"
---

# SMS lead alert

## What it does

1. **Trigger:** a new lead arrives at a Webhooks by Zapier catch hook (any website form can post to it). Facebook Lead Ads "New Lead" can be added as a second trigger.
2. **AI by Zapier** reads the raw submission, even with odd field names, and returns `name`, `phone`, `need` (under 45 characters, with city and timing) and `reply` (a friendly text under 60 characters using the lead's first name).
3. **SMS by Zapier** texts the owner:
   ```
   Maria Lopez
   (201) 555-0148

   Leaking water heater, Union City, today

   Reply: "Hi Maria, I can come by this afternoon. Does 3pm work?"
   ```

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names. Without Zapier MCP, the Zapier SDK CLI works too (`npx skills add zapier/agent-skills --skill workflows-create`).

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`. Facebook Lead Ads "New Lead" is an optional second trigger; only add it if the user asks. If the user wants more than one trigger, add them all to the one workflow when your tools allow it (Next Gen Zaps support several triggers). If your tools take only one trigger per workflow, as Zapier MCP's `update_workflow_draft` does today, install the same `workflow.ts` once per trigger and name the copies so the user can tell them apart.
2. **Connections** (each alias in the code is the app's slug):
   - `sms`: the user's SMS by Zapier connection. Ask them to connect it if they haven't.
   - AI by Zapier needs no connection. `authentication_id: "0"` in the code means Zapier's managed AI credentials; leave it as is.
3. **Constants:** none. The phone number lives in the SMS by Zapier connection, not the code.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point their form at.

## Ask the user

- Is their SMS by Zapier connection set up with the phone that should get the alerts? SMS by Zapier only texts the number verified on that connection, so there is nothing to set in the code.
- Where do leads come from: a website form, Facebook Lead Ads, or both?

## Test

### 1. Webhook sample

Run each sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Posting it to the webhook URL only works once the workflow is published.

Run this sample lead:

```json
{
  "full_name": "Maria Lopez",
  "tel": "(201) 555-0148",
  "msg": "Water heater leaking, Union City, can someone come today?"
}
```

Confirm the text arrives within about a minute.

### 2. Real test from the lead source

A posted sample proves the logic, not the real source. Also test from where leads actually come from:

- **Website form:** point the form at the webhook URL and submit it once yourself, the way a customer would. Check that the AI still finds the name, phone and need from the form's real field names.
- **Facebook Lead Ads:** with the trigger connected to the right page and form, use Meta's Lead Ads Testing Tool to create a test lead, then pull it with the trigger's test and run the workflow.
  Confirm the text arrives for the real submission too.

## Customize

- **Message format:** the `message` template in `workflow.ts`
- **Reply tone or length:** the AI `instructions`
- **Lead sources:** add triggers such as Facebook Lead Ads

## Notes

- SMS by Zapier texts only the verified owner number. It sends alerts to you, not texts to the lead.
- Never commit a real webhook URL or phone number. Anyone who has the URL can trigger texts.
