---
name: create-loan-application-records-from-social-lead-forms
description: Build a Zap on Zapier that turns each Facebook Lead Ads form submission into a standardized loan application record in Airtable, matched by email so repeat applicants update their existing record. Use when a lender or loan broker collects applications through social lead forms and wants them in an intake table for coordinators and loan officers without retyping.
license: MIT
metadata:
  author: zapier
  summary: "Each new Facebook lead form submission becomes a loan application record in your Airtable intake table, with a readable timestamp, a cleaned-up phone number and revenue figure, campaign details and a source tag."
  apps: "Facebook Lead Ads, Airtable"
  category: "Finance"
  job: "Loan management"
  source: "https://zapier.com/automations/finance/loan-management/loan-application-processing/create-loan-application-records-from-social-lead-forms"
---

# Create loan application records from social lead forms

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-loan-application-records-from-social-lead-forms. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a person submits the chosen lead form on a Facebook Page (`facebook-lead-ads`, `lead`).
2. **Filter:** only qualifying submissions continue: there must be a full name and a valid-looking email. Anything else returns `skipped` and writes nothing.
3. **Formatting (plain code, not steps):** the lead's `created_time` becomes a readable application timestamp (e.g. `Oct 29, 2026, 10:15 AM UTC`). The phone number keeps only digits and a leading `+`. A revenue answer such as `$250k` or `1,200,000` becomes a whole number.
4. **Airtable** upserts one record in the intake table, matched on email: if a record with that email exists it is updated, otherwise a new one is created. It writes the submission ID (external reference), application timestamp, full name, email, phone, business name, revenue estimate, campaign, ad set, ad and form names, and a single source tag.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                         | Where                      | What goes there                                                                 |
| ------------------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| `REPLACE_FACEBOOK_PAGE_ID`      | `triggers/lead.ts`, `page` | The Facebook Page whose lead form starts the Zap                                |
| `REPLACE_FACEBOOK_LEAD_FORM_ID` | `triggers/lead.ts`, `form` | The lead form that starts the Zap; delete the line to take any form on the page |
| `REPLACE_AIRTABLE_BASE_ID`      | `config.ts`                | The Airtable base that holds the loan applications (its ID starts with `app`)   |
| `REPLACE_AIRTABLE_TABLE`        | `config.ts`                | The intake table that receives the applications: its ID (`tbl…`) or exact name  |

Also review the defaults with them:

- The `FIELD_*` names in `config.ts` must match the intake table's fields. The table needs a field named by `FIELD_EMAIL`, because records are matched on it. If the table lacks any of them, Airtable rejects the write: rename the constants to match, or add the fields.
- `LEAD_PHONE_KEY`, `LEAD_BUSINESS_NAME_KEY` and `LEAD_REVENUE_KEY` are the keys their form delivers. Facebook's standard questions arrive uppercased (`PHONE_NUMBER`, `COMPANY_NAME`); custom questions use whatever key the form defines. Sample a lead to confirm them.
- `TIME_ZONE` (default `"UTC"`) and `SOURCE_LABEL` (default `"Facebook Lead Ads"`), the source tag written to every record.
- What makes a submission qualifying. The default is a name and a valid email; add conditions in code if they want more, such as a minimum revenue.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `airtable` to the user's Airtable connection for the account that owns the intake base. The trigger uses `facebook-lead-ads`, so bind it to the user's Facebook Lead Ads connection for the Page.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/lead.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test (`run_workflow_draft` in Zapier MCP) before publishing, against a test table or with an email that is clearly a test:

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

Check that one record exists for `install-test+loan@example.com` with the timestamp `Oct 29, 2026, 10:15 AM UTC`, phone `+15550102030`, revenue `250000` and the source tag. Run it again and confirm the same record was updated, not duplicated. Then run it with `"EMAIL": ""` and confirm it returns `skipped` and writes nothing. If run-status tools aren't available, check the result in Airtable directly. Ask the user to delete the test records; the agent does not delete test data.

## Notes

- The Airtable write uses the app's raw API request action (a `PATCH` with `performUpsert` on the email field and `typecast: true`), because the field-by-field Create Record action needs field keys that can only be read from a connected base. `typecast` lets Airtable create missing select options and convert text to numbers.
- Emails are lowercased before matching, so `Jane@Example.com` and `jane@example.com` are the same applicant. If more than one record has the same email, Airtable rejects the upsert, so keep emails unique in the table.
- Facebook's Lead Ads Testing Tool can send a test lead, so you can sample real keys before publishing.
- The table holds applicants' personal and financial details. Never commit a real base ID, and limit who can see the table.
- To extend it: add a lookup before the upsert (for example, a campaigns table keyed by `campaign_id`), or set a priority field when the revenue estimate passes a threshold.
