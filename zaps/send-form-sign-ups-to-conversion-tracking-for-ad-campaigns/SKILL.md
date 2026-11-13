---
name: send-form-sign-ups-to-conversion-tracking-for-ad-campaigns
description: Build a Zap on Zapier that sends each new HubSpot form submission to a LinkedIn Conversions API conversion, so LinkedIn ad campaigns get sign-up attribution without manual uploads. Use when a marketing team runs HubSpot forms as lead capture for LinkedIn ads and wants sign-ups reported to LinkedIn automatically.
license: MIT
metadata:
  author: zapier
  summary: "Each new HubSpot form sign-up is sent to LinkedIn as a conversion, so your ad campaigns can see which clicks turned into sign-ups."
  apps: "HubSpot, LinkedIn Conversions"
  category: "Marketing"
  job: "Marketing analytics"
  source: "https://zapier.com/automations/marketing/marketing-analytics/marketing-attribution/send-form-sign-ups-to-conversion-tracking-for-ad-campaigns"
---

# Send form sign-ups to conversion tracking for ad campaigns

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-form-sign-ups-to-conversion-tracking-for-ad-campaigns. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** HubSpot, New Form Submission (`hubspot`, `form_submission_resthook_v3`), for one form. The submission ID and email come from the trigger.
2. **Code** skips the run if the submission has no ID or no email. Duplicate submissions are not filtered; see Notes.
3. **LinkedIn Conversions** sends a conversion event for that email to one LinkedIn conversion, with the HubSpot submission ID as the event ID.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                     | Where                                               | What goes there                                                                                                                       |
| --------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_HUBSPOT_FORM_GUID` | `triggers/form-submission-resthook.ts`, `form_guid` | The HubSpot form whose sign-ups get reported                                                                                          |
| `LINKEDIN_AD_ACCOUNT`       | `config.ts`                                         | The LinkedIn ad account that owns the conversion                                                                                      |
| `LINKEDIN_CONVERSION`       | `config.ts`                                         | The Conversions API conversion each sign-up is reported to. Create it in Campaign Manager first; it must be of type "Conversions API" |

Also review the default with them: the Zap skips a submission with no email. Ask whether a sign-up without one should still be sent; the template skips it.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `hubspot` to the HubSpot connection for the portal that owns the form, and `linkedin-conversions` to the LinkedIn connection for the Campaign Manager account that owns the conversion. The trigger and the action use the same accounts.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/form-submission-resthook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a submission from the user's HubSpot test form, and a LinkedIn conversion marked as a test:

```json
{
  "id": "900000000001",
  "Email": "test.signup@example.com",
  "vid": "900001"
}
```

Check that the run finished, that the LinkedIn step returned a status, and that the conversion shows in Campaign Manager's conversion tracking with the submission ID as the event ID. If run-status tools aren't available, check the result in LinkedIn Campaign Manager directly. Then publish, confirm the trigger is active, and ask the user to delete the test data, not the agent. Never run it with a real customer's email.

## Notes

- Duplicate submissions are not filtered: a durable workflow has no shared store of past submission IDs. LinkedIn may deduplicate on the event ID; check that for the user's conversion before relying on it.
- The trigger declares only `id`, `vid` and `Email`, so name, company and UTM fields are not mapped.
- To add campaign detail, parse the UTM fields from the submission. To make sure the lead exists in HubSpot first, add or update a contact before the conversion.
- Never commit a real form ID, ad account ID, conversion ID or test email. The values in `config.ts` and the trigger are placeholders on purpose.
