---
name: create-monthly-investor-update-and-assign-drafting-task
description: Build a Zapier Next Gen Zap that, on the first of each month, copies an investor update template into a dated Google Doc, creates a ClickUp drafting task that links to it, and emails collaborators the link. Use when a founder or finance lead produces a monthly investor or board update from a standard template and wants the drafting task and distribution handled automatically.
metadata:
  author: zapier
  summary: "Each month a dated investor update is created from your template, a drafting task links to it, and your collaborators get the link so the report is ready to review."
  apps: "Schedule by Zapier, Google Docs, ClickUp, Email by Zapier"
  category: "Executives"
  job: "Investor board reporting"
  source: "https://zapier.com/automations/executives/investor-board-reporting/investor-update-distribution/create-monthly-investor-update-and-assign-drafting-task"
---

# Create monthly investor update and assign drafting task

## What it does

1. **Trigger:** Schedule by Zapier, every month on day 1 at 12:00 PM, America/New_York. It sends no data, so the workflow reads the date itself.
2. **Google Docs** copies your template into a new document titled `Investor update <Month YYYY>`, fills its `{{report_date}}` placeholder with the same month, and sets organization-only edit sharing.
3. **ClickUp** looks for a task with the same title. If none exists, it creates one that links to the document, starts on the run date, is due 7 days later, and is assigned to the drafting owner. If one exists, it creates nothing.
4. **Email by Zapier** sends collaborators a short email with the document link and the month.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at its top.

1. **Trigger:** Schedule by Zapier, Every Month (`schedule` / `everyMonth`). Parameters: `dom: ["1"]`, `hod: "12:00 PM"`, `timezone_override: "America/New_York"`. It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `google-docs`: the Google account that owns the template and the output folder.
   - `clickup`: the ClickUp account that owns the workspace.
   - `email`: no connection. Email by Zapier sends from zapiermail.com.
3. **Constants:**
   - `TEMPLATE_DOC_ID`: the template's ID, from its URL.
   - `DOC_FOLDER`: the Drive folder for new documents, or `"root"`.
   - `ORG_DOMAIN`: your Google Workspace domain, needed for the sharing setting.
   - `TITLE_PREFIX`: empty for real use.
   - `CLICKUP_WORKSPACE_ID`: the ClickUp workspace (team) ID.
   - `DRAFTER_EMAIL`: the ClickUp user who gets the drafting task.
   - `COLLABORATOR_EMAILS`: the addresses that get the ready email.
   - `DUE_OFFSET_DAYS`: days after the run date that the task is due.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user the trigger's schedule (nothing needs pasting; it runs on its own).

## Ask the user

- Which Google Doc is the template? It must contain a `{{report_date}}` placeholder, and the output folder should be a Drive folder ID or `"root"`.
- Which ClickUp workspace and list should the drafting task go in? The Create Task step's list field must be set in the editor (see Notes).
- Who is the drafting owner in ClickUp, and who gets the ready email?
- Is the schedule right: day 1 at noon New York time, and is a due date 7 days after the run date what they want?

## Test

No trigger payload is used. The sample input was the direct Google Docs call that the Test run stood in for:

```json
{
  "file": "<template doc ID>",
  "title": "[install-test] Investor update October 2026",
  "folder": "root",
  "domain": "<your domain>",
  "sharing_preference": "org_link_edit",
  "empty_fields_preference": "keep",
  "template_field__report_date": "October 2026"
}
```

Check that the new document's title matches, that its body reads `Period: October 2026` (the placeholder filled), and that the document is shared as the sharing setting says. The test doc and template were both named `[install-test] …` and should be deleted by the user.

Still to check on a real run, because they did not run here: that the ClickUp task appears with the document link, the due date and the assignee; that a second run in the same month creates no duplicate task; and that the email arrives with the document link.

## Customize

- **Reminder:** add a reminder two days before the due date.
- **Financial snapshot:** attach a current financial snapshot to the new document automatically.

## Notes

- Email by Zapier sends from zapiermail.com, not your own address, and is limited to 10 emails per hour on paid plans.
- The ClickUp Create Task step's list field could not be read without a ClickUp connection, so the code does not set a list. Set the list in the editor before publishing.
- Sharing uses "Anyone at your organization with the link can edit" so no document is public. The Google Docs response did not confirm the sharing was applied on the test doc, so check the document's sharing once.
- The document title and task title carry `TITLE_PREFIX`. The deployed test copy used `"[install-test] "`; this copy has it empty.
