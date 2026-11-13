---
name: create-monthly-investor-update-and-assign-drafting-task
description: Build a Zap on Zapier that, on the first of each month, copies an investor update template into a dated Google Doc, creates a ClickUp drafting task that links to it, and emails collaborators the link. Use when a founder or finance lead produces a monthly investor or board update from a standard template and wants the drafting task and distribution handled automatically.
license: MIT
metadata:
  author: zapier
  summary: "Each month a dated investor update is created from your template, a drafting task links to it, and your collaborators get the link so the report is ready to review."
  apps: "Schedule by Zapier, Google Docs, ClickUp, Email by Zapier"
  category: "Executives"
  job: "Investor board reporting"
  source: "https://zapier.com/automations/executives/investor-board-reporting/investor-update-distribution/create-monthly-investor-update-and-assign-drafting-task"
---

# Create monthly investor update and assign drafting task

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-monthly-investor-update-and-assign-drafting-task. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** `schedule`, every month on day 1 at 12:00 PM, America/New_York. It sends no data, so the workflow reads the date itself.
2. **`google-docs`** copies the template into a new document titled `Investor update <Month YYYY>`, fills its `{{report_date}}` placeholder with the same month, and sets organization-only edit sharing.
3. **`clickup`** looks for a task with the same title. If none exists, it creates one that links to the document, starts on the run date, is due 7 days later, and is assigned to the drafting owner. If one exists, it creates nothing.
4. **`email`** sends the collaborators a short email with the document link and the month.

The document is shared with your organization only, never publicly.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                        | What goes there                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| `REPLACE_TEMPLATE_DOC_ID`      | The Google Doc copied each month, in `config.ts`. It must contain a `{{report_date}}` placeholder |
| `REPLACE_DOC_FOLDER`           | The Drive folder for new documents, in `config.ts`, or `"root"`                                   |
| `REPLACE_ORG_DOMAIN`           | The Google Workspace domain used for the organization sharing setting, in `config.ts`             |
| `REPLACE_CLICKUP_WORKSPACE_ID` | The ClickUp workspace that gets the drafting task, in `config.ts`                                 |
| `REPLACE_DRAFTER_EMAIL`        | The email of the ClickUp user who gets the drafting task, in `config.ts`                          |
| `REPLACE_COLLABORATOR_EMAIL`   | The addresses that get the ready email, in `COLLABORATOR_EMAILS` in `workflow.ts`, one per entry  |

Also review the defaults with them:

- `TITLE_PREFIX` (`config.ts`) is empty for real use.
- `DUE_OFFSET_DAYS` (`workflow.ts`) is 7: the drafting task is due that many days after the run date.
- The schedule in `triggers/every-month.ts` is day 1 at 12:00 PM, America/New_York.

Ask which ClickUp list gets the drafting task. The Create Task step needs one and the code does not set it (see Notes). Confirm the schedule is right: day 1 at noon New York time, with a due date 7 days after the run date.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-docs` to the Google account that owns the template and the output folder, and `clickup` to the ClickUp account that owns the workspace. Schedule by Zapier (`schedule`) and Email by Zapier (`email`) need no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/every-month.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

No trigger payload is used. Run the Google Docs step once as a draft test with this sample input, with `file` set to a copy of the template so the real one is not touched. The run sets the title and report date from the run month, so the sample's month is only an example:

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

For the test, set `TITLE_PREFIX` to `"[install-test] "` in the draft, and leave it empty when publishing.

Check that the new document's title is `[install-test] Investor update <Month YYYY>`, that its body reads `Period: <Month YYYY>` (the placeholder filled), and that the document is shared as the sharing setting says. If run-status tools aren't available, check Google Docs directly. The user deletes the test document and template, not the agent.

Still to check on a real run: that the ClickUp task appears with the document link, the due date and the assignee; that a second run in the same month creates no duplicate task; and that the email arrives with the document link. Then publish, and confirm the trigger is active.

## Notes

- Email by Zapier sends from zapiermail.com, not your own address, and is limited to 10 emails per hour on paid plans.
- The code does not set the ClickUp list for the Create Task step. Set it in the editor before publishing.
- Sharing is "Anyone at your organization with the link can edit", so no document is public. The Google Docs response does not confirm the sharing setting, so check it once after the first run.
- `TITLE_PREFIX` is added to the document, task and email titles.
- To extend it: add a reminder two days before the due date, or attach a current financial snapshot to the new document.
