---
name: create-backlog-items-from-product-wish-form-submissions
description: Build a Zap on Zapier that turns each new product wish form submission into an intake payload, with the consent answer normalized to Yes or No, and posts it to your intake endpoint. Use when a product team collects feature requests through a Google Form and wants each one sent on to a backlog or triage system.
license: MIT
metadata:
  author: zapier
  summary: "Every product wish form submission is sent to your intake endpoint as a clean backlog item, with reporter, request and interview consent in one payload."
  apps: "Google Forms, Webhooks by Zapier"
  category: "Product"
  job: "Product feedback management"
  source: "https://zapier.com/automations/product/product-feedback-management/feature-request-tracking/create-backlog-items-from-product-wish-form-submissions"
---

# Create backlog items from product wish form submissions

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-backlog-items-from-product-wish-form-submissions. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new response is submitted to the Google Form that collects product wishes (`google-forms`, `new_form_response`).
2. **Consent:** the consent answer is read as a Yes or No flag. Any answer that isn't a recognised yes counts as No.
3. **Intake:** the reporter's email, request title, request description and the Yes/No consent flag, plus a product label, are POSTed as JSON to your intake endpoint. Your triage system creates the backlog item from there.

The workflow creates one intake request for every submission. It doesn't skip any.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                   | What goes there                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_FORM_ID`         | The Google Form that collects the wishes, looked up with the user's Google Forms connection. The trigger's Form field gets the same ID. |
| `REPLACE_INTAKE_URL`      | The intake endpoint that receives each backlog item as JSON                                                                             |
| `REPLACE_PRODUCT_CONTEXT` | The product or area label sent with every item                                                                                          |

Also review the defaults with them: `EMAIL_FIELD`, `TITLE_FIELD`, `DESCRIPTION_FIELD` and `CONSENT_FIELD` in `config.ts` must match the keys in a real response, and `CONSENT_YES_VALUES` in `workflow.ts` lists the lowercase answers that count as Yes. Ask which consent answers mean yes.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-forms` to the user's Google account that owns the wish form. The trigger uses it too. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-form-response.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match. Set the trigger's Form field to the form from `FORM_ID`.

## Test it

Run it once as a draft test with this sample submission:

```json
{
  "email": "pat@example.com",
  "title": "Bulk export to CSV",
  "description": "Export all open requests from the board in one click.",
  "consent": "Yes, I agree to a 30-minute interview"
}
```

Check that the intake endpoint receives one JSON payload with `reporter_email`, `request_title`, `request_description`, `interview_consent` set to `Yes`, and `product`. Then run a second sample with a consent answer that isn't a yes, such as `No thanks`, and check that `interview_consent` is `No`. If run-status tools aren't available, check the result in your intake endpoint directly. Ask the user to delete the test items; the agent doesn't delete them.

## Notes

- The trigger's output field names are only known once the Google Forms connection can read a real response. Check them before the first run.
- The workflow forwards the reporter's email. Matching a submission to an existing item by email is left to the intake endpoint.
- Anyone with the intake endpoint URL can post items to it. Keep the URL out of shared copies of this file.
- To send to a project management tool instead of the intake endpoint, swap the Webhooks step for that tool's create-item action. To tag by keyword for priority or feature area, add a plain JavaScript step that checks the description and adds the tags to the payload.
