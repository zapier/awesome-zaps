---
name: add-free-trial-buyers-to-sales-outreach-list
description: Build a Zapier Next Gen Zap that takes each new free-trial signup from an ActiveCampaign automation webhook, creates or updates the contact, adds them to your sales outreach list and tags them as a trial buyer. Use when a sales team wants trial signups to enter an outreach list the moment they arrive, without anyone copying contacts by hand.
metadata:
  author: zapier
  summary: "Every new free-trial signup is added to your sales outreach list automatically, so the sales team can start reaching out straight away."
  apps: "ActiveCampaign"
  category: "Sales"
  job: "Outbound sales"
  source: "https://zapier.com/automations/sales/outbound-sales/prospecting/add-free-trial-buyers-to-sales-outreach-list"
---

# Add free trial buyers to sales outreach list

## What it does

1. **Trigger:** an automation in ActiveCampaign sends a webhook for a trial signup (the **New Automation Webhook** trigger).
2. **ActiveCampaign** creates the contact, or updates it if one with the same email already exists.
3. **ActiveCampaign** subscribes that contact to your outreach list.
4. **ActiveCampaign** adds a trial-buyer tag to the contact. This step can be switched off with a constant.

Signups with no email address are skipped.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** ActiveCampaign, New Automation Webhook (`activecampaign`, `new_automation_webhook`). It runs on the user's ActiveCampaign connection.
2. **Connections** (each alias in the code is the app's slug):
   - `activecampaign`: the user's ActiveCampaign connection.
3. **Constants:**
   - `OUTREACH_LIST_ID`: the ID of the ActiveCampaign list that the sales team works from. Every trial signup is added to it.
   - `TRIAL_TAG`: the tag added to each trial buyer. Defaults to `"Trial buyer"`.
   - `ADD_TRIAL_TAG`: `true` to add the tag, `false` to skip that step.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point their ActiveCampaign automation at.

## Ask the user

- Which ActiveCampaign list is the outreach list? Copy its ID into `OUTREACH_LIST_ID`.
- Should the tag be something other than `Trial buyer`, or should tagging be turned off?
- Which fields does the automation's webhook send? The workflow reads `contact__email`, `contact__first_name`, `contact__last_name` and `contact__id`. If the webhook sends them under other names, change the input schema before installing.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, using a contact that exists in the user's ActiveCampaign account:

```json
{
  "contact__email": "jane.buyer@example.com",
  "contact__first_name": "Jane",
  "contact__last_name": "Buyer",
  "contact__id": "1234"
}
```

Confirm that the contact exists in ActiveCampaign, is subscribed to the outreach list, and carries the trial-buyer tag. Then remove the test contact from the list if it was not a real signup.

## Customize

- **Start an onboarding automation** instead of adding to the list, for customers who need a segmented sequence.
- **Only add qualifying signups:** add a condition on a plan field or flag, so only trial signups that meet it reach the outreach list.

## Notes

- A webhook payload without an email address is skipped. The run finishes with `skipped: true` and writes nothing.
- The outreach list ID is specific to one ActiveCampaign account. Do not share it publicly.
- Anyone who can post to the automation's webhook can add contacts to the list, so keep the webhook URL private.
