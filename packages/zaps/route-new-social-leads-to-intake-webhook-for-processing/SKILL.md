---
name: route-new-social-leads-to-intake-webhook-for-processing
description: Build a Zapier Next Gen Zap that sends each new Facebook Lead Ads submission as normalized JSON to your intake endpoint. Use when social lead forms need to reach an internal intake or qualification system immediately, without manual copying.
metadata:
  author: zapier
  summary: "Each new Facebook lead form submission is posted as clean JSON to your intake system, so leads are processed the moment they arrive."
  apps: "Facebook Lead Ads, Webhooks by Zapier"
  category: "Marketing"
  job: "Lead management"
  source: "https://zapier.com/automations/marketing/lead-management/lead-routing/route-new-social-leads-to-intake-webhook-for-processing"
---

# Route new social leads to intake webhook for processing

## What it does

1. **Trigger:** a new lead is submitted on a Facebook Lead Ads form (Facebook Lead Ads, New Lead).
2. **Webhooks by Zapier** POSTs a JSON body to your intake endpoint. The body has the contact name, email and phone, the notes, the ad's form, page and ad IDs, and the submission time. It also includes the raw lead payload for troubleshooting.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below.

1. **Trigger:** Facebook Lead Ads, New Lead (`facebook-lead-ads`, `lead`). It needs the user's Facebook Lead Ads connection and a Page. Form: "Default (Any Form)".
2. **Connections:**
   - `facebook-lead-ads`: the user's Facebook Lead Ads connection, for the Page that owns the lead form.
   - Webhooks by Zapier (`webhook`) needs no connection.
3. **Constants:**
   - `INTAKE_WEBHOOK_URL`: the URL of your intake endpoint. Replace `YOUR_INTAKE_WEBHOOK_URL`.
   - `INCLUDE_RAW_LEAD`: `true` adds the raw lead payload to the body. Set `false` to leave it out.
   - Trigger `page`: the Facebook Page ID. Replace `YOUR_PAGE_ID` in the trigger configuration.

## Ask the user

- Which Facebook Page and lead form should trigger the workflow? ("Default (Any Form)" covers every form on the Page.)
- What is the intake endpoint URL, and does it need an API key? The spec asks for a key header stored in a connection. The workflow as written sends no header; see Notes.
- Should the raw lead payload go in the body, or only the normalized fields?

## Test

Testing needs a Facebook Lead Ads connection and a Page with a real or test lead form, and an intake endpoint that can receive a POST. Suggested test once those exist: submit a test lead on the form, or use a draft test run with this sample input:

```json
{
  "full_name": "Test Lead",
  "email": "test.lead@example.com",
  "phone_number": "+15555550100",
  "comments": "[install-test] sample lead",
  "created_time": "2026-10-29T10:15:00Z",
  "form_id": "1234567890",
  "page_id": "0987654321",
  "ad_id": "1122334455"
}
```

Check that your intake endpoint receives one JSON body with `contact`, `notes`, `ad` and `submitted_at` filled in. The field names in the sample are not verified against Facebook's real payload; check the real keys on the first run and fix the mapping in `workflow.ts` if they differ.

## Customize

- **Dedupe lookup:** add a lookup step before the POST to block repeat submissions. Not built.
- **Formatter:** normalize phone numbers or localize timestamps before the POST. Not built.

## Notes

- The spec's API key header is not built. The spec wants the key stored in a connection, and Webhooks by Zapier has no connection for it. Adding it means putting the key in a header in the POST action, which should be done with the user's own secret store, not in this file.
- Never commit a real intake URL or Page ID. Anyone with the intake URL can post leads to your system.
