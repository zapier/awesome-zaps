---
name: enroll-webhook-signups-into-sms-reminder-campaign-for-event
description: Build a Zapier Next Gen Zap that takes a signup posted to a webhook, creates or updates the matching LeadConnector contact as a lead, and enrolls it in an SMS reminder campaign for an event. Use when an event registration or signup form posts to a webhook and the attendees should get SMS reminders through LeadConnector (GoHighLevel).
metadata:
  author: zapier
  summary: "When someone signs up for your event through a form, they're saved as a lead in LeadConnector and enrolled in your SMS reminder campaign, so they get reminders without anyone adding them by hand."
  apps: "Webhooks by Zapier, LeadConnector"
  category: "Marketing"
  job: "SMS marketing"
  source: "https://zapier.com/automations/marketing/sms-marketing/sms-campaign-management/enroll-webhook-signups-into-sms-reminder-campaign-for-event"
---

# Enroll webhook signups into SMS reminder campaign for event

## What it does

1. **Trigger:** a signup arrives at a Webhooks by Zapier catch hook (a registration form or script posts to it). The payload's `first_name`, `last_name`, `email` and `phone` are read; a missing field is treated as blank.
2. **Plain code** normalizes the phone number to E.164 (`+` then digits), adding the default country code to 10-digit numbers. If there is neither an email nor a phone number, the run stops and writes nothing.
3. **LeadConnector** adds or updates the contact, marked as a lead, with the source `webhook`. LeadConnector matches an existing contact by email, then by phone, and creates one when neither matches.
4. **LeadConnector** adds that contact to the SMS reminder campaign (its "Add Lead to Workflow" action).

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `leadconnector`: the user's LeadConnector connection, for the account that holds the contacts and the SMS campaign.
3. **Constants:**
   - `CAMPAIGN_ID`: the ID of the SMS reminder campaign (LeadConnector calls it a workflow). Copy it from the campaign's settings.
   - `DEFAULT_COUNTRY_CODE`: the country code added to 10-digit phone numbers. Defaults to `"1"` (US and Canada).
   - `SIGNUP_SOURCE`: written to the contact's source and lead-source fields. Defaults to `"webhook"`.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point their signup form at.

## Ask the user

- Which LeadConnector campaign (workflow) is the SMS reminder campaign for the event? Put its ID in `CAMPAIGN_ID`.
- What field names does the signup form send? The code expects `first_name`, `last_name`, `email` and `phone`. Rename them in `InputSchema` if the form uses other names.
- Should only signups that have opted in to SMS be enrolled? The spec's Customize section describes this; it is not built.
- Are phone numbers outside the US and Canada? If so, have the form send them with a `+` country code, or change `DEFAULT_COUNTRY_CODE`.

## Test

When the connection is in place, run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a test contact whose phone number is the connected SMS by Zapier number, so no real person is texted:

```json
{
  "first_name": "Test",
  "last_name": "Signup",
  "email": "install-test@example.com",
  "phone": "5555550100"
}
```

Confirm that the contact exists in LeadConnector with source `webhook` and the lead flag set, and that it is enrolled in the campaign. Then remove the test contact, as it was not real data.

## Customize

- **Only enroll on opt-in:** enroll only when an SMS opt-in or consent field is present in the payload.
- **Tag the source:** add UTM or source tags to the contact record, for reporting downstream.

## Notes

- LeadConnector matches contacts by email first and phone second. The code relies on that upsert; it does not look contacts up itself.
- The code skips a payload with neither email nor phone. The spec did not say what to do then; this is a decision made for the build.
- Anyone with the webhook URL can add contacts and enroll them in the campaign. Keep it private.
- Never commit a real campaign ID or webhook URL.
