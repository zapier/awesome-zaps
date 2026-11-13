---
name: route-new-social-leads-to-intake-webhook-for-processing
description: Build a Zap on Zapier that sends each new Facebook Lead Ads submission as normalized JSON to your intake endpoint. Use when social lead forms need to reach an internal intake or qualification system immediately, without manual copying.
license: MIT
metadata:
  author: zapier
  summary: "Each new Facebook lead form submission is posted as clean JSON to your intake system, so leads are processed the moment they arrive."
  apps: "Facebook Lead Ads, Webhooks by Zapier"
  category: "Marketing"
  job: "Lead management"
  source: "https://zapier.com/automations/marketing/lead-management/lead-routing/route-new-social-leads-to-intake-webhook-for-processing"
---

# Route new social leads to intake webhook for processing

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/route-new-social-leads-to-intake-webhook-for-processing. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new lead is submitted on a Facebook Lead Ads form (`facebook-lead-ads`, `lead`). The default form setting covers every form on the Page.
2. **Webhooks by Zapier** (`webhook`) POSTs a JSON body to the intake endpoint. The body has the contact name, email and phone, the notes, the ad's form, page and ad IDs, and the submission time. It also includes the raw lead payload for troubleshooting.

The body carries personal contact details, so send it only to an endpoint you control.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                      | What goes there                                                                                             |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `REPLACE_INTAKE_WEBHOOK_URL` | The intake endpoint URL that receives the lead JSON: a Webhooks by Zapier catch hook, or the user's own URL |

Also review these with the user:

- `INCLUDE_RAW_LEAD` in `workflow.ts`: `true` adds the raw lead payload to the body for troubleshooting; `false` leaves it out.
- Which Facebook Page and lead form should trigger the Zap? "Default (Any Form)" covers every form on the Page.
- Does the intake endpoint need an API key? The workflow sends no header; see Notes.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `facebook-lead-ads` to the user's Facebook Lead Ads connection for the Page that owns the lead form. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/lead.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with the intake endpoint set to one you control, using this sample input:

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

Check that the endpoint receives one JSON body with `contact`, `notes`, `ad` and `submitted_at` filled in. The sample's field names are not verified against Facebook's real payload, so check the real keys on the first run and fix the mapping in `workflow.ts` if they differ. If run-status tools aren't available, check the result in your intake system directly. Then publish, confirm the trigger is active, and do the real thing once: submit a test lead on the form. Ask the user to delete the test lead and any record it created; the agent doesn't delete test data.

## Notes

- The API key header is not built. The spec wants the key stored in a connection, and Webhooks by Zapier has no connection for it. To add one, put the key in a header on the POST action from the user's own secret store, never in `workflow.ts`.
- A dedupe lookup and a Formatter step (normalizing phone numbers or timestamps) are not built. Add them before the POST if needed.
- Never commit a real intake URL or Page ID. Anyone with the intake URL can post leads to your system.
