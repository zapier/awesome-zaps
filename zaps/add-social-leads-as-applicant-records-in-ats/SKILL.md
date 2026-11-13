---
name: add-social-leads-as-applicant-records-in-ats
description: Build a Zap on Zapier that takes each new Facebook Lead Ads form submission, tidies the phone number and name, and sends it to your applicant tracking system as an applicant record. Use when a recruiting team gets candidates from social lead forms and wants them in the ATS without re-typing.
license: MIT
metadata:
  author: zapier
  summary: "Each new Facebook lead form submission becomes an applicant record in your ATS, with a cleaned phone number and split name, ready for a recruiter to review."
  apps: "Facebook Lead Ads, Webhooks by Zapier"
  category: "Human Resources (HR)"
  job: "Recruiting"
  source: "https://zapier.com/automations/human-resources-hr/recruiting/job-application-management/add-social-leads-as-applicant-records-in-ats"
---

# Add social leads as applicant records in ATS

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/add-social-leads-as-applicant-records-in-ats. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new lead from a Facebook Lead Ads form (`facebook-lead-ads`, `lead`).
2. **Normalize:** the phone number is reduced to digits (keeping a leading `+`), and a combined full name is split into first and last name. Plain JavaScript, no step.
3. **Send to ATS:** one JSON POST via Webhooks by Zapier (`webhook`, `post`) to your applicant tracking system's webhook. It carries the applicant's name, email, phone, language, the source tag `Facebook Lead Ads`, the intake stage, and `match_by: "email"`. The ATS decides whether to match an existing record by email or create a new one.

The Zap only posts to your ATS. It doesn't contact the applicant.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting           | What goes there                                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| `ATS_WEBHOOK_URL` | The applicant tracking system's webhook URL that accepts applicant records as JSON. Ask the user for it.              |
| `INTAKE_STAGE`    | The stage sourced applicants are assigned to when created, as named in their applicant tracking system. Ask the user. |

Also ask:

- Which Facebook Page and lead form should feed this? The trigger's Page and Form choices come from the connected Facebook account.
- Does the ATS match applicants by email on its own? If not, a lookup step is needed before the POST.
- Does the lead form use `full_name`, `email`, `phone_number` and `language` as its field names? These were assumed, because the lead payload couldn't be sampled.

Defaults worth reviewing: `SOURCE_TAG` (`Facebook Lead Ads`), written to every applicant record.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `facebook-lead-ads` (the Facebook account that owns the lead form's Page, used by the trigger) to the user's Facebook connection. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/lead.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with a lead from a form the user controls and an ATS endpoint that is a test or sandbox environment. Use a sample like this:

```json
{
  "full_name": "[install-test] Jane Example",
  "email": "jane.example@example.com",
  "phone_number": "+1 (555) 010-0100",
  "language": "English"
}
```

Check that the ATS receives one record with `first_name` "[install-test] Jane", `last_name` "Example", `phone` "+15550100100", `source` "Facebook Lead Ads", and the intake stage. If run-status tools aren't available, check the result in the applicant tracking system directly. Ask the user to delete the test record; the agent doesn't delete test data. Then publish, and confirm the trigger is active.

## Notes

- Facebook lead field names vary by form. If the form's fields differ from `full_name`, `email`, `phone_number` and `language`, update the input schema in `workflow.ts` before publishing.
- Phone formatting only strips non-digits and adds no country code, so numbers entered without one stay as typed.
- To dedupe by phone instead of email, change the lookup key in the ATS payload. To enrich the record first (resume parsing or a score), add a step between normalize and the POST.
- Never commit a real ATS webhook URL. Anyone with it can create applicant records.
