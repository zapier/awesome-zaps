---
name: create-loan-application-records-from-social-lead-forms
description: Build a Zapier Next Gen Zap that turns each Facebook Lead Ads form submission into a standardized loan application record in Airtable, matched by email so repeat applicants update their existing record. Use when a lender or loan broker collects applications through social lead forms and wants them in an intake table for coordinators and loan officers without retyping.
metadata:
  author: zapier
  summary: "Each new Facebook lead form submission becomes a loan application record in your Airtable intake table, with a readable timestamp, a cleaned-up phone number and revenue figure, campaign details and a source tag."
  apps: "Facebook Lead Ads, Airtable"
  category: "Finance"
  job: "Loan management"
  source: "https://zapier.com/automations/finance/loan-management/loan-application-processing/create-loan-application-records-from-social-lead-forms"
---

# Create loan application records from social lead forms

## What it does

1. **Trigger:** a person submits the chosen lead form on a Facebook Page (Facebook Lead Ads, New Lead).
2. **Filter:** only qualifying submissions continue: there must be a full name and a valid-looking email. Anything else returns `skipped` and writes nothing.
3. **Formatting (plain code, not steps):** the lead's `created_time` becomes a readable application timestamp (e.g. `Oct 29, 2026, 10:15 AM UTC`). The phone number keeps only digits and a leading `+`. A revenue answer such as `$250k` or `1,200,000` becomes a whole number.
4. **Airtable** upserts one record in the intake table, matched on email: if a record with that email exists it is updated, otherwise a new one is created. It writes the submission ID (external reference), application timestamp, full name, email, phone, business name, revenue estimate, campaign, ad set, ad and form names, and a single source tag.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Facebook Lead Ads, New Lead (`facebook-lead-ads`, `lead`). It needs the user's Facebook Lead Ads connection as `authentication_id`. Params: `page` (required, the Facebook Page ID from `get_trigger_field_choices`) and `form` (the lead form, or leave unset for any form on the page).
2. **Connections** (each alias in the code is the app's slug):
   - `airtable`: the user's Airtable connection, for the account that owns the intake base.
3. **Constants:**
   - `AIRTABLE_BASE_ID`: the base ID (`app…`) from the base URL.
   - `AIRTABLE_TABLE`: the table ID (`tbl…`) or its exact name.
   - `FIELD_*`: the names of the table's fields. The table must have a field named as `FIELD_EMAIL`, because records are matched on it. Fields the table lacks will make Airtable reject the write, so rename the constants to match, or add the fields.
   - `SOURCE_LABEL`: the source tag written to every record. Defaults to `"Facebook Lead Ads"`.
   - `LEAD_PHONE_KEY`, `LEAD_BUSINESS_NAME_KEY`, `LEAD_REVENUE_KEY`: the keys the user's form delivers for phone, business name and revenue. Facebook's standard questions arrive uppercased (`PHONE_NUMBER`, `COMPANY_NAME`); custom questions use whatever key the form defines. Read them off a sampled lead.
   - `TIME_ZONE`: an IANA time zone for the readable timestamp. Defaults to `"UTC"`.
4. Sample the trigger with the chosen page and form, check the lead keys against the constants, test with the steps below, then publish and wait until the trigger is active.

## Ask the user

- Which Facebook Page and lead form should start it?
- Which Airtable base and table hold loan applications, and what are the field names for each item in "What it does"?
- What do their form's phone, business-name and revenue questions come through as? (Sample a lead to find out.)
- What makes a submission qualifying? The default is "has a name and a valid email"; add conditions in code if they want more, such as a minimum revenue.
- Which time zone should the application timestamp use, and what source tag should records carry?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, against a test table or with an email that is clearly a test:

```json
{
  "id": "install-test-lead-0001",
  "created_time": "2026-10-29T10:15:00+0000",
  "FULL_NAME": "[install-test] Jordan Rivera",
  "EMAIL": "install-test+loan@example.com",
  "PHONE_NUMBER": "+1 (555) 010-2030",
  "COMPANY_NAME": "[install-test] Rivera Bakery LLC",
  "ANNUAL_REVENUE": "$250k",
  "campaign_name": "[install-test] Small business loans Q4",
  "adset_name": "[install-test] NYC owners",
  "ad_name": "[install-test] Working capital ad",
  "form_name": "[install-test] Loan application form",
  "platform": "fb"
}
```

Check that one record exists for `install-test+loan@example.com` with the timestamp `Oct 29, 2026, 10:15 AM UTC`, phone `+15550102030`, revenue `250000` and the source tag. Run it again and confirm the same record was updated, not duplicated. Then run it with `"EMAIL": ""` and confirm it returns `skipped` and writes nothing. Delete the test record afterwards.

## Customize

- **Enrich with campaign metadata:** add a lookup step before the upsert (for example, a campaigns table in Airtable keyed by `campaign_id`) and write the extra fields onto the record.
- **Priority review for high-value applicants:** when the revenue estimate passes a threshold, set a priority field or status so they show up in an intake coordinator's priority view in Airtable.

## Notes

- The Airtable write uses the app's API request action (a `PATCH` with `performUpsert` on the email field and `typecast: true`), because the field-by-field Create Record action needs field keys that can only be read from a connected base. `typecast` lets Airtable create missing select options and convert text to numbers.
- If more than one existing record has the same email, Airtable rejects the upsert. Keep emails unique in the table.
- Emails are lowercased before matching, so `Jane@Example.com` and `jane@example.com` are the same applicant.
- Facebook can deliver a test lead from its Lead Ads Testing Tool. Use it to sample real keys before publishing.
- Never commit a real base ID. This table holds applicants' personal and financial details, so limit who can see it.
