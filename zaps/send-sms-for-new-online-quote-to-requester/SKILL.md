---
name: send-sms-for-new-online-quote-to-requester
description: Build a Zap on Zapier that takes an online quote request posted to a webhook, saves the requester as a Quo contact, and texts them right away to ask for their location and service type. Use when a business takes quote requests through a web form or script and wants an immediate SMS reply that gathers context for support.
license: MIT
metadata:
  author: zapier
  summary: "When someone requests a quote online, they get a text right away asking for their location and service, and their details are saved as a contact in Quo."
  apps: "Webhooks by Zapier, Quo"
  category: "Marketing"
  job: "SMS marketing"
  source: "https://zapier.com/automations/marketing/sms-marketing/transactional-sms/send-sms-for-new-online-quote-to-requester"
---

# Send SMS for new online quote to requester

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-sms-for-new-online-quote-to-requester. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a quote request arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). A web form or script posts the request to it.
2. **Quo** creates or updates a contact, matching on the requester's phone number, so repeat requesters update one contact instead of creating duplicates.
3. **Quo** sends a short SMS to the phone number: a greeting with the requester's first name, asking for their location and the service they need.

If the payload has no usable phone number, the run stops after the trigger and sends nothing.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting              | What goes there                              |
| -------------------- | -------------------------------------------- |
| `QUO_FROM_NUMBER_ID` | The Quo phone number the texts are sent from |

Also review the default message with them: `SMS_TEMPLATE` in `workflow.ts`, where `{first_name}` is replaced with the requester's first name, or "there" if no name arrived.

Confirm that the form or script sends `name`, `phone` and `email`. If it uses other field names, change the input schema in `workflow.ts` before installing.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `quo` to the user's Quo connection, the account the texts are sent and contacts are saved through. Webhooks by Zapier needs no account.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it. For the catch hook, read the whole payload, with no child key picked.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's `quo` connection and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match. Once it is published, give the user the catch hook's URL to point their form or script at.

## Test it

Run this sample as a draft test (`run_workflow_draft` in Zapier MCP) before publishing. Use a phone number you control, and a Quo connection whose sending number is a test line.

```json
{
  "name": "Jordan Test",
  "phone": "+15555550123",
  "email": "jordan@example.com"
}
```

Check that a contact with that phone number exists in Quo with the name and email, that the SMS arrived on the test phone with "Hi Jordan", and that a second run with the same phone updates the same contact rather than creating a new one. Then run once with no `phone` key: the run should stop with `no-valid-phone` and send nothing.

If run-status tools aren't available, check the result in Quo directly. Ask the user to delete the test contact in Quo; the agent does not delete test data.

## Notes

- The sender's phone format matters. The code keeps digits and a leading `+`, so send E.164 (for example `+15555550123`) to get reliable matches.
- The SMS goes through Quo, so Quo's messaging policy applies. Keep the template to its one purpose of gathering context.
- Anyone with the webhook URL can send texts to the phone numbers in the payload. Keep the URL private.
- The question text in the payload is not read, and no step uses it.
- To extend it: post the quote summary to a Slack or internal channel for triage after the SMS, or skip the SMS for some requests (a flag in the message, or a missing phone) and queue an agent callback instead.
