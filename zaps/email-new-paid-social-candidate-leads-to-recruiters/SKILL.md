---
name: email-new-paid-social-candidate-leads-to-recruiters
description: Build a Zap on Zapier that logs each new Facebook Lead Ads candidate to a recruiting spreadsheet and emails the recruiters a short summary with a link to the sheet. Use when paid social or web form candidate leads arrive in Facebook Lead Ads and recruiters want each one logged for tracking and alerted by email without manual copying.
license: MIT
metadata:
  author: zapier
  summary: "Each new candidate who answers your Facebook lead form is added to a tracking sheet and your recruiters get an email with their details and a link to the sheet."
  apps: "Facebook Lead Ads, Google Sheets, Microsoft Outlook"
  category: "Human Resources (HR)"
  job: "Recruiting"
  source: "https://zapier.com/automations/human-resources-hr/recruiting/candidate-screening/email-new-paid-social-candidate-leads-to-recruiters"
---

# Email new paid social candidate leads to recruiters

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/email-new-paid-social-candidate-leads-to-recruiters. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new lead on a Facebook Lead Ads form (`facebook-lead-ads-beta`, `lead`, the default form).
2. **Formatter (plain code):** trims and normalizes the name, keeps digits and `+` in the phone, lowercases the email, takes the first number from years of experience, and joins certification answers. If the lead has no submission ID, the run stops and writes nothing.
3. **Google Sheets** appends one row per lead: submission ID, name, phone, email, years, certifications, and the time it was logged.
4. **Microsoft Outlook** sends an HTML email to the configured recruiters with the applicant summary and a link to the recruiting sheet.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                   | What goes there                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `REPLACE_SPREADSHEET_ID`  | The sheet that holds the recruiting log. Look up its ID from the sheet the user picks, the long ID in its URL |
| `REPLACE_RECRUITER_EMAIL` | Each recruiter address that gets an alert. Add one entry to `RECRUITER_EMAILS` per address                    |

Also review the defaults with them: `WORKSHEET_ID` (`"0"` is the first tab; set it to the tab that holds the log), the columns in `workflow.ts` (`COLUMNS` writes A to G as submission ID, name, phone, email, years, certifications and logged at, so map them to the user's headers), `FIELD_KEYS` (read the field keys from a real lead rather than guessing), and which Facebook lead form the trigger watches.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` to the Google account that owns the recruiting sheet, and `microsoft-outlook` to the Outlook account that sends the alert. The trigger's `facebook-lead-ads-beta` account is the Facebook Lead Ads connection for the Page. Formatter needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/lead.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a test lead whose submission ID does not already exist in the sheet:

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

Check that one new row was appended to the configured worksheet with the normalized values and a logged-at time, and that one email reached the recruiter address with the summary and a link to the sheet. If run-status tools aren't available, check the sheet and the recruiter's inbox directly. Then publish, confirm the trigger is active, and ask the user to delete the test row and test email, since the agent does not delete test data.

## Notes

- Google Sheets may show the logged-at time in the sheet's own format and time zone.
- The email link opens the recruiting worksheet, not the exact row.
- If the sheet append succeeds but the email fails, the row stays logged and the run shows the email error.
- To alert in a team chat or another email app, replace the Outlook step. To take leads from another paid social or web form source, change the trigger.
- Never commit a real spreadsheet ID or recruiter address.
