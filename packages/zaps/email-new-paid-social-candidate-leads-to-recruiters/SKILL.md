---
name: email-new-paid-social-candidate-leads-to-recruiters
description: Build a Zapier Next Gen Zap that logs each new Facebook Lead Ads candidate to a recruiting spreadsheet and emails the recruiters a short summary with a link to the sheet. Use when paid social or web form candidate leads arrive in Facebook Lead Ads and recruiters want each one logged for tracking and alerted by email without manual copying.
metadata:
  author: zapier
  summary: "Each new candidate who answers your Facebook lead form is added to a tracking sheet and your recruiters get an email with their details and a link to the sheet."
  apps: "Facebook Lead Ads, Google Sheets, Microsoft Outlook"
  category: "Human Resources (HR)"
  job: "Recruiting"
  source: "https://zapier.com/automations/human-resources-hr/recruiting/candidate-screening/email-new-paid-social-candidate-leads-to-recruiters"
---

# Email new paid social candidate leads to recruiters

## What it does

1. **Trigger:** a new lead on a Facebook Lead Ads form (`lead`, default form).
2. **Formatter (plain code):** trims and normalizes the name, keeps digits and `+` in the phone, lowercases the email, takes the first number from years of experience, and joins certification answers. If the lead has no submission ID, the run stops and writes nothing.
3. **Google Sheets** appends one row per lead: submission ID, name, phone, email, years, certifications, and the time it was logged.
4. **Microsoft Outlook** sends an HTML email to the configured recruiters with the applicant summary and a link to the recruiting sheet.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Facebook Lead Ads, New Lead (`facebook-lead-ads-beta`, action `lead`). Needs the user's Facebook Lead Ads connection, which is bound by the trigger's `authentication_id`.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the Google account that owns the recruiting sheet.
   - `microsoft-outlook`: the Outlook account that sends the alert. Emails go from this account to the recruiter addresses.
3. **Constants:**
   - `SPREADSHEET_ID`: the long ID in the sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `RECRUITER_EMAILS`: the recruiter addresses that get each alert.
   - `FIELD_KEYS`: the keys of the lead's fields in the Facebook payload. The values shown are placeholders to confirm against a real lead.
   - `COLUMNS`: the sheet's column keys, such as `COL$A`, in the order A to G. Map them to the user's headers.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the Facebook form setup they need.

## Ask the user

- Which sheet and tab hold the recruiting log, and which column letters hold each field?
- Which recruiter addresses should get the alert?
- Which Facebook lead form should trigger it: any form on the Page, or one specific form?
- What are the field keys in the lead payload (name, phone, email, years of experience, certifications)? Read them from a real lead rather than guessing.

## Test

To test, run a draft test run (`run_workflow_draft`) with a sample lead whose submission ID does not already exist in the user's sheet:

```json
{
  "id": "TEST-LEAD-0001",
  "full_name": "Test Candidate",
  "phone_number": "+1 555 0100",
  "email": "test.candidate@example.com",
  "years_of_experience": "5 years",
  "certifications": ["AWS Certified", "PMP"]
}
```

Confirm that one new row was appended to the configured worksheet with the normalized values and a logged-at time, and that one email reached the recruiter address with the summary and a link to the sheet. Then tell the user to delete the test row if it was real data.

## Customize

- **Replace Microsoft Outlook** with any team email or chat app for alerts.
- **Swap Facebook Lead Ads** for any paid social or web form source.

## Notes

- Google Sheets may show the logged-at time in the sheet's own format and time zone.
- The email link opens the recruiting worksheet, not the exact row.
- If the sheet append succeeds but the email fails, the row stays logged and the run shows the email error.
- Never commit a real spreadsheet ID, recruiter address or webhook URL.
