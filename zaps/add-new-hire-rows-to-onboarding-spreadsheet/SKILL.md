---
name: add-new-hire-rows-to-onboarding-spreadsheet
description: Build a Zapier Next Gen Zap that adds a row to a Google Sheets onboarding tracker every time a candidate is marked hired in Ashby, with the start date, job title, new hire's name and email, and hiring manager. Use when a People Ops, HR or recruiting team runs Ashby as its ATS and wants every hire handed off to onboarding, payroll and facilities in one consistent sheet without retyping.
license: MIT
metadata:
  author: zapier
  summary: "When a candidate is hired in Ashby, a row with their start date, title, contact email and hiring manager lands in your onboarding spreadsheet, so People Ops, payroll and facilities all start from the same details."
  apps: "Ashby, Google Sheets"
  category: "Human Resources (HR)"
  job: "HR operations"
  source: "https://zapier.com/automations/human-resources-hr/hr-operations/new-hire-documentation/add-new-hire-rows-to-onboarding-spreadsheet"
---

# Add new hire rows to onboarding spreadsheet

## What it does

1. **Trigger:** a candidate is marked hired in Ashby. The event carries the application (candidate, job, hiring team) and the most recent accepted offer.
2. The workflow picks the hiring manager: the hiring team member with the `Hiring Manager` role, or the first team member if nobody has that role.
3. **Google Sheets** adds one row to the onboarding worksheet with the offer's start date, the job title, the new hire's name and primary email, and the manager's name and email. Every hire gets a new row.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and the trigger's fields (`get_trigger_fields`), and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** the files in this folder are the whole zap. `workflow.ts` is the workflow. It imports its settings from `config.ts` and each account from `connections/<alias>.ts`, and `triggers/` holds what starts it.

- **With the zap CLI:** `npx zap-pack add awesome-zaps/add-new-hire-rows-to-onboarding-spreadsheet` (it makes a zap project if you aren't in one), then `npx zap-pack deploy add-new-hire-rows-to-onboarding-spreadsheet` from that project. Deploy asks for each open setting and account, and sets the trigger.
- **With Zapier MCP:** publish every `.ts` file outside `triggers/` as `sourceFiles`, with three changes: write `config.ts` as plain values (`export const NAME = "value";`), write each `connections/<alias>.ts` as `export default "<alias>";`, and write each `@/name` import as a relative path ending in `.ts` (`./config.ts`, `./connections/<alias>.ts`). Set the trigger from the file in `triggers/`.

1. **Trigger:** Ashby, Candidate Hired (`ashby`, `candidate_hired`). It has no input fields, so `params` is `{}`. Its `authentication_id` is the user's Ashby connection, an API key with permission to read candidates, jobs and offers.
2. **Connections** (each alias in the code is the app's slug):
   - `ashby`: the user's Ashby connection, used by the trigger.
   - `google-sheets`: the user's Google Sheets connection, for the account that owns the onboarding sheet.
3. **Constants:**
   - `SPREADSHEET_ID`: the long ID in the onboarding sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `START_DATE_COLUMN`, `TITLE_COLUMN`, `NAME_COLUMN`, `CONTACT_EMAIL_COLUMN`, `MANAGER_NAME_COLUMN`, `MANAGER_EMAIL_COLUMN`: column keys such as `COL$A`, not header names. Map the user's headers to their column letters.
   - `HIRING_MANAGER_ROLE`: the Ashby hiring team role to treat as the manager. Defaults to `"Hiring Manager"`.
4. Test with the steps below, then publish and wait until the trigger is active.

## Ask the user

- Which sheet and tab is the onboarding tracker, and which columns hold start date, title, name, contact email, manager name and manager email? The tab needs a header row.
- Which Ashby connection should the trigger use? Ashby API keys are scoped, so the key must be allowed to read offers or the start date comes through blank.
- Is the manager in their Ashby hiring teams labeled `Hiring Manager`, or another role?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, pointed at a copy of the onboarding sheet:

```json
{
  "action": "candidateHire",
  "data": {
    "application": {
      "id": "app-1001",
      "candidate": {
        "id": "cand-1001",
        "name": "Jordan Rivera",
        "primaryEmailAddress": { "value": "jordan.rivera@example.com" }
      },
      "job": { "title": "People Operations Specialist" },
      "hiringTeam": [
        {
          "email": "sam.lee@example.com",
          "firstName": "Sam",
          "lastName": "Lee",
          "role": "Recruiter"
        },
        {
          "email": "alex.kim@example.com",
          "firstName": "Alex",
          "lastName": "Kim",
          "role": "Hiring Manager"
        }
      ]
    },
    "offer": { "latestVersion": { "startDate": "2026-12-01" } }
  }
}
```

Confirm one new row appears with `2026-12-01`, `People Operations Specialist`, `Jordan Rivera`, `jordan.rivera@example.com`, `Alex Kim` and `alex.kim@example.com` in the mapped columns. Alex is chosen over Sam because of the role. Delete the test row afterward.

## Customize

- **Only some hires:** add a filter so the row is written only for exempt or non-exempt hires, read from an offer custom field.
- **Alert payroll or facilities:** add a Slack message or email after the row is created, with the new hire's name and start date.

## Notes

- If the hire has no accepted offer in Ashby, the start date cell is left blank.
- Re-marking the same application as hired in Ashby can add a second row for it.
- The sheet holds new hires' names and emails. Share it only with the people who need onboarding details.
- Never commit a real spreadsheet ID.
