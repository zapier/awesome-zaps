---
name: send-form-sign-ups-to-conversion-tracking-for-ad-campaigns
description: Build a Zapier Next Gen Zap that sends each new HubSpot form submission to a LinkedIn Conversions API conversion, so LinkedIn ad campaigns get sign-up attribution without manual uploads. Use when a marketing team runs HubSpot forms as lead capture for LinkedIn ads and wants sign-ups reported to LinkedIn automatically.
metadata:
  author: zapier
  summary: "Each new HubSpot form sign-up is sent to LinkedIn as a conversion, so your ad campaigns can see which clicks turned into sign-ups."
  apps: "HubSpot, LinkedIn Conversions"
  category: "Marketing"
  job: "Marketing analytics"
  source: "https://zapier.com/automations/marketing/marketing-analytics/marketing-attribution/send-form-sign-ups-to-conversion-tracking-for-ad-campaigns"
---

# Send form sign-ups to conversion tracking for ad campaigns

## What it does

1. **Trigger:** HubSpot, New Form Submission, for one form. The submission ID and email come from the trigger.
2. **Code** skips the run if the submission has no ID or no email. There is no duplicate check: see Notes.
3. **LinkedIn Conversions** sends a conversion event for that email to one LinkedIn conversion, with the HubSpot submission ID as the event ID.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top of the file and the trigger's form.

1. **Trigger:** HubSpot, `form_submission_resthook_v3` (New Form Submission), `selected_api` `hubspot`. Set the trigger's `form_guid` param to the form's ID. It needs the HubSpot connection.
2. **Connections** (each alias in the code is the app's slug):
   - `hubspot`: the HubSpot connection for the portal that owns the form.
   - `linkedin-conversions`: the LinkedIn connection for the Campaign Manager account that owns the conversion.
3. **Constants** (top of `workflow.ts`):
   - `LINKEDIN_AD_ACCOUNT`: the LinkedIn ad account ID.
   - `LINKEDIN_CONVERSION`: the Conversions API conversion to report to. Create it in Campaign Manager first; it must be of type "Conversions API".
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the trigger's webhook details if the editor shows any. Nothing runs until the form submits.

## Ask the user

- Which HubSpot form should trigger the conversions, and what is its form ID?
- Which LinkedIn ad account and which Conversions API conversion should receive them?
- Should a sign-up with no email still be sent? The template skips it.

## Test

Run this sample as a draft test run (`run_workflow_draft`) before publishing. Use a submission that exists in the user's HubSpot test form, and a LinkedIn conversion that is marked as a test:

```json
{
  "id": "YOUR_TEST_SUBMISSION_ID",
  "Email": "YOUR_TEST_EMAIL",
  "vid": "YOUR_TEST_CONTACT_VID"
}
```

Check that the run finished, that the LinkedIn step returned a status, and that the conversion shows in Campaign Manager's conversion tracking with the submission ID as the event ID. Do not run it with a real customer's email.

## Customize

- **Add or update a contact in HubSpot** before the conversion, so the lead exists in the CRM.
- **Parse UTM and campaign fields** from the submission to add campaign detail to the conversion.

## Notes

- The HubSpot form trigger declares only `id`, `vid` and `Email`. Name, company and UTM fields are not mapped; see the template's lossy list in the result.
- Duplicate submissions are not filtered. A durable workflow has no shared store to remember past submission IDs. LinkedIn may deduplicate on the event ID; check that for the user's conversion before relying on it.
- Never commit a real form ID, ad account ID, conversion ID or test email. The constants in `workflow.ts` are placeholders on purpose.
