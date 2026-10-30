---
name: send-sms-for-new-online-quote-to-requester
description: Build a Zapier Next Gen Zap that takes an online quote request posted to a webhook, saves the requester as a Quo contact, and texts them right away to ask for their location and service type. Use when a business takes quote requests through a web form or script and wants an immediate SMS reply that gathers context for support.
metadata:
  author: zapier
  summary: "When someone requests a quote online, they get a text right away asking for their location and service, and their details are saved as a contact in Quo."
  apps: "Webhooks by Zapier, Quo"
  category: "Marketing"
  job: "SMS marketing"
  source: "https://zapier.com/automations/marketing/sms-marketing/transactional-sms/send-sms-for-new-online-quote-to-requester"
---

# Send SMS for new online quote to requester

## What it does

1. **Trigger:** a quote request arrives at a Webhooks by Zapier catch hook (a web form or script posts to it).
2. **Quo** creates or updates a contact using the requester's phone number as the match key, so repeat requesters update one contact instead of creating duplicates.
3. **Quo** sends a short SMS to the phone number: a greeting with the requester's first name, asking for their location and the service they need.

If the payload has no usable phone number, the run stops after the trigger and sends nothing.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`. The payload is read as a whole, with no child key picked.
2. **Connections** (each alias in the code is the app's slug):
   - `quo`: the user's Quo connection. The app is listed as Quo in the Zapier catalog.
3. **Constants:**
   - `QUO_FROM_NUMBER_ID`: the Quo phone number ID the SMS is sent from. Copy it from Quo's phone number settings.
   - `SMS_TEMPLATE`: the message body. `{first_name}` is replaced with the requester's first name, or "there" if no name arrived.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point their form or script at.

## Ask the user

- Which Quo phone number should the texts come from?
- What does the form or script send for the requester's name, phone, and email? The code reads them as `name`, `phone` and `email`. If the sender uses other field names, change the input schema before installing.
- Should the message wording change from the default?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a phone number you control, and a Quo connection whose sending number is a test line.

```json
{
  "name": "Jordan Test",
  "phone": "+15555550123",
  "email": "jordan@example.com"
}
```

Confirm that a contact with that phone number exists in Quo with the name and email, that the SMS arrived on the test phone with "Hi Jordan", and that a second run with the same phone updates the same contact rather than creating a new one. Then delete the test contact in Quo.

Also run once with no `phone` key. The run should stop with `no-valid-phone` and send nothing.

## Customize

- **Slack or internal channel step:** post the quote summary to a channel for triage after the SMS is sent.
- **Skip the SMS for some requests:** send no SMS and queue an agent callback when the message contains a specific flag or the phone is missing.

## Notes

- The spec's "extract the question text" step is not built. The question text is not used by any step, so it is not read from the payload.
- Phone matching works only if the phone is in a consistent format. The code keeps digits and a leading `+`, so send E.164 (for example `+15555550123`) from the form to get reliable matches.
- The SMS is sent through Quo. Quo's messaging policy applies to the text, so keep the template to the single purpose of gathering context.
- Anyone with the webhook URL can send texts to the phone numbers in the payload. Keep the URL private.
