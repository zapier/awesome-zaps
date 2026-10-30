---
name: add-social-leads-as-applicant-records-in-ats
description: Build a Zapier Next Gen Zap that takes each new Facebook Lead Ads form submission, tidies the phone number and name, and sends it to your applicant tracking system as an applicant record. Use when a recruiting team gets candidates from social lead forms and wants them in the ATS without re-typing.
metadata:
  author: zapier
  summary: "Each new Facebook lead form submission becomes an applicant record in your ATS, with a cleaned phone number and split name, ready for a recruiter to review."
  apps: "Facebook Lead Ads, Webhooks by Zapier"
  category: "Human Resources (HR)"
  job: "Recruiting"
  source: "https://zapier.com/automations/human-resources-hr/recruiting/job-application-management/add-social-leads-as-applicant-records-in-ats"
---

# Add social leads as applicant records in ATS

## What it does

1. **Trigger:** a new lead from a Facebook Lead Ads form (the New Lead trigger).
2. **Normalize:** the phone number is reduced to digits (keeping a leading `+`), and a combined full name is split into first and last name. Plain JavaScript, no step.
3. **Send to ATS:** one JSON POST via Webhooks by Zapier to your applicant tracking system's webhook. It carries the applicant's name, email, phone, language, the source tag `Facebook Lead Ads`, the intake stage, and `match_by: "email"`. The ATS decides whether to match an existing record by email or create a new one.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Facebook Lead Ads, New Lead (`facebook-lead-ads`, action `lead`). It needs a connected Facebook account, and the Page and Form are chosen from that account.
2. **Connections:**
   - `facebook-lead-ads`: the Facebook account that owns the lead form's Page.
   - `webhook` (Webhooks by Zapier): no connection needed.
3. **Constants:**
   - `ATS_WEBHOOK_URL`: your ATS's webhook URL that accepts applicant JSON.
   - `INTAKE_STAGE`: the stage new applicants land in.
   - `SOURCE_TAG`: fixed to `Facebook Lead Ads` unless you want another label.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the webhook details for their ATS.

## Ask the user

- Which Facebook Page and lead form should feed this? (The trigger's Page and Form choices come from the connected account.)
- What is the ATS's webhook URL, and does it match applicants by email on its own? If not, a lookup step is needed.
- Which stage should new applicants land in?
- Does the lead form use `full_name`, `email`, `phone_number` and `language` as its field names? These were assumed, because the lead payload couldn't be sampled.

## Test

Before publishing, run a draft test with a lead from a form the user controls, and an ATS endpoint that is a test or sandbox environment. Use a sample like this:

```json
{
  "full_name": "[install-test] Jane Example",
  "email": "jane.example@example.com",
  "phone_number": "+1 (555) 010-0100",
  "language": "English"
}
```

Check that the ATS receives one record with `first_name` "[install-test] Jane", `last_name` "Example", `phone` "+15550100100", `source` "Facebook Lead Ads", and the intake stage. Then remove the test record from the ATS.

## Customize

- **Dedupe by phone** instead of email, for regions where emails are unreliable: change the lookup key in the ATS payload, or add a lookup step before the POST.
- **Enrich before creating the record** (resume parsing or a score): add a step between normalize and the POST.

## Notes

- Facebook lead field names vary by form. If the form's fields differ from the names this zap assumed, update the input schema before publishing.
- Phone formatting only strips non-digits. It doesn't add a country code, so leads entered without one stay as typed.
- Never commit a real ATS webhook URL. Anyone with it can create applicant records.
