---
name: add-new-hire-rows-to-onboarding-spreadsheet
description: Build a Zap on Zapier that adds a row to a Google Sheets onboarding tracker every time a candidate is marked hired in Ashby, with the start date, job title, new hire's name and email, and hiring manager. Use when a People Ops, HR or recruiting team runs Ashby as its ATS and wants every hire handed off to onboarding, payroll and facilities in one consistent sheet without retyping.
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

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/add-new-hire-rows-to-onboarding-spreadsheet. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a candidate is marked hired in Ashby (`ashby`, `candidate_hired`). The event carries the application (candidate, job, hiring team) and the most recent accepted offer.
2. The workflow picks the hiring manager: the hiring team member with the `Hiring Manager` role, or the first team member if nobody has that role.
3. **Google Sheets** adds one row to the onboarding worksheet with the offer's start date, the job title, the new hire's name and primary email, and the manager's name and email. Every hire gets a new row.

The Zap only writes to the sheet. It does not change anything in Ashby.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting          | What goes there                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| `SPREADSHEET_ID` | The onboarding tracker sheet. Ask which sheet it is, then look up its ID with the user's Google Sheets connection. |

Also review the defaults with them:

- `WORKSHEET_ID`: the tab, where `"0"` is the first tab. The tab needs a header row.
- `START_DATE_COLUMN` through `MANAGER_EMAIL_COLUMN`: column keys such as `COL$A`, not header names. Ask which columns hold the start date, title, name, contact email, manager name and manager email, and map them to their column letters.
- `HIRING_MANAGER_ROLE`: the Ashby hiring team role treated as the manager, `"Hiring Manager"` by default. Ask whether their hiring managers carry that label or another role.

Ask which Ashby connection the trigger should use. Its API key must be allowed to read offers, or the start date comes through blank.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` (the account that owns the onboarding sheet) and `ashby` (the trigger's account, an API key that can read candidates, jobs and offers) to the user's connections. No other app needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/candidate-hired.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

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

Confirm one new row appears with `2026-12-01`, `People Operations Specialist`, `Jordan Rivera`, `jordan.rivera@example.com`, `Alex Kim` and `alex.kim@example.com` in the mapped columns. Alex is chosen over Sam because of the role. If run-status tools aren't available, check the result in Google Sheets directly. Ask the user to delete the test row; the agent doesn't delete it.

Then publish and confirm the trigger is active.

## Notes

- If the hire has no accepted offer in Ashby, the start date cell is left blank. Re-marking the same application as hired can add a second row for it.
- To write rows only for some hires, add a filter on an offer custom field. To alert payroll or facilities, add a Slack message or email after the row is created.
- The sheet holds new hires' names and emails. Share it only with the people who need onboarding details, and don't commit a real spreadsheet ID to a repository.
