---
name: enroll-webhook-signups-into-sms-reminder-campaign-for-event
description: Build a Zap on Zapier that takes a signup posted to a webhook, creates or updates the matching LeadConnector contact as a lead, and enrolls it in an SMS reminder campaign for an event. Use when an event registration or signup form posts to a webhook and the attendees should get SMS reminders through LeadConnector (GoHighLevel).
license: MIT
metadata:
  author: zapier
  summary: "When someone signs up for your event through a form, they're saved as a lead in LeadConnector and enrolled in your SMS reminder campaign, so they get reminders without anyone adding them by hand."
  apps: "Webhooks by Zapier, LeadConnector"
  category: "Marketing"
  job: "SMS marketing"
  source: "https://zapier.com/automations/marketing/sms-marketing/sms-campaign-management/enroll-webhook-signups-into-sms-reminder-campaign-for-event"
---

# Enroll webhook signups into SMS reminder campaign for event

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/enroll-webhook-signups-into-sms-reminder-campaign-for-event. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a signup arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`), posted by a registration form or script. The payload's `first_name`, `last_name`, `email` and `phone` are read; a missing field is treated as blank.
2. **Plain code** normalizes the phone number to E.164 (`+` then digits), adding the default country code to 10-digit numbers. If there is neither an email nor a phone number, the run stops and writes nothing.
3. **LeadConnector** adds or updates the contact, marked as a lead, with the source `webhook`. LeadConnector matches an existing contact by email, then by phone, and creates one when neither matches.
4. **LeadConnector** adds that contact to the SMS reminder campaign.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting       | What goes there                                                                  |
| ------------- | -------------------------------------------------------------------------------- |
| `CAMPAIGN_ID` | The LeadConnector campaign (workflow) that sends the SMS reminders for the event |

Also review the defaults with them: `DEFAULT_COUNTRY_CODE` (`"1"`, for US and Canada numbers without a `+` prefix) and `SIGNUP_SOURCE` (`"webhook"`, written to each contact so enrollments can be traced).

Before building, confirm:

- What field names does the signup form send? The code expects `first_name`, `last_name`, `email` and `phone`. Rename them in `InputSchema` if the form uses other names.
- Should only signups that have opted in to SMS be enrolled? That is not built; see Notes.
- Are phone numbers outside the US and Canada? If so, have the form send them with a `+` country code, or change `DEFAULT_COUNTRY_CODE`.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `leadconnector` to the user's LeadConnector connection for the account that holds the contacts and the SMS campaign. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test (`run_workflow_draft` in Zapier MCP) before publishing. Use a test contact whose phone number is the connected SMS by Zapier number, so no real person is texted:

```json
{
  "first_name": "Test",
  "last_name": "Signup",
  "email": "install-test@example.com",
  "phone": "5555550100"
}
```

Check that the contact exists in LeadConnector with source `webhook` and the lead flag set, and that it is enrolled in the campaign. If run-status tools aren't available, check LeadConnector directly. Then ask the user to delete the test contact; the agent does not delete it.

## Notes

- LeadConnector matches contacts by email first and phone second. The code relies on that upsert and does not look contacts up itself.
- A payload with neither email nor phone is skipped and writes nothing. The spec did not say what to do then; this is a decision made for the build.
- After publishing, give the user the trigger's webhook URL to point their signup form at. Anyone with that URL can add contacts and enroll them in the campaign, so keep it private.
- To enroll only opted-in signups, add a check for an SMS opt-in field in the payload. To tag the source, add UTM or source tags to the contact for reporting.
