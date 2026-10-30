---
name: create-backlog-items-from-product-wish-form-submissions
description: Build a Zapier Next Gen Zap that turns each new product wish form submission into an intake payload, with the consent answer normalized to Yes or No, and posts it to your intake endpoint. Use when a product team collects feature requests through a Google Form and wants each one sent on to a backlog or triage system.
metadata:
  author: zapier
  summary: "Every product wish form submission is sent to your intake endpoint as a clean backlog item, with reporter, request and interview consent in one payload."
  apps: "Google Forms, Webhooks by Zapier"
  category: "Product"
  job: "Product feedback management"
  source: "https://zapier.com/automations/product/product-feedback-management/feature-request-tracking/create-backlog-items-from-product-wish-form-submissions"
---

# Create backlog items from product wish form submissions

## What it does

1. **Trigger:** a new response is submitted to the Google Form that collects product wishes (Google Forms, New Form Response).
2. **Consent:** the consent answer is read as a Yes or No flag. Any answer that isn't a recognised yes counts as No.
3. **Intake:** the reporter's email, request title, request description and the Yes/No consent flag, plus a product label, are POSTed as JSON to your intake endpoint. Your triage system creates the backlog item from there.

The workflow creates one intake request for every submission. It doesn't skip any.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Google Forms, New Form Response (`google-forms`, `new_form_response`). Pick the wish form in the trigger's **Form** field. The trigger needs the user's Google Forms connection.
2. **Connections:**
   - Google Forms: the user's Google account that owns the form. Bind it to the trigger.
   - Webhooks by Zapier: no connection needed. Its `authentication_id` is `null`.
3. **Constants:**
   - `INTAKE_URL`: the endpoint that receives each backlog item.
   - `PRODUCT_CONTEXT`: the product or area label sent with every item.
   - `EMAIL_FIELD`, `TITLE_FIELD`, `DESCRIPTION_FIELD`, `CONSENT_FIELD`: the form's field keys for the reporter email, request title, request description and consent answer. Set them to the keys in a real response.
   - `CONSENT_YES_VALUES`: the lowercase answers that count as Yes.
   - `FORM_ID`: the long ID in the form's URL. Set the same ID in the trigger's Form field.

## Ask the user

- Which Google Form collects the wishes, and what is its ID?
- What is the intake endpoint URL, and what should the product label be?
- Which answers in the consent question mean yes?
- What are the exact field names in the form's responses? If they differ from the defaults, the constants need to change.

## Test

Send one sample submission through the test flow (`run_workflow_draft` in Zapier MCP) before publishing:

```json
{
  "email": "pat@example.com",
  "title": "Bulk export to CSV",
  "description": "Export all open requests from the board in one click.",
  "consent": "Yes, I agree to a 30-minute interview"
}
```

Check that the intake endpoint receives one JSON payload with `reporter_email`, `request_title`, `request_description`, `interview_consent` set to `Yes`, and `product`. Then try a consent answer that isn't a yes, such as `No thanks`, and check that `interview_consent` is `No`.

## Customize

- **Send to a project management tool** instead of the intake endpoint: swap the Webhooks step for the tool's create-item action.
- **Tag by keyword** to set priority or feature area: add a plain JavaScript step that checks the description for keywords and adds them to the payload.

## Notes

- The trigger's output field names are only known once the Google Forms connection can read a real response. Check them before the first run.
- The workflow forwards the reporter's email. Matching a submission to an existing item by email is left to the intake endpoint, since the workflow doesn't look up existing items.
- Anyone with the intake endpoint URL can post items to it. Keep the URL out of shared copies of this file.
