---
name: create-change-of-manager-ticket-from-supervisor-email
description: Build a Zap on Zapier that watches a Microsoft Outlook HR folder for supervisor emails about a change of manager, uses AI by Zapier to pull out the employee and new manager names, and opens an HR service request ticket in Freshservice. Use when an HR help desk, HR operations or people team runs case management in Freshservice and wants manager change requests sent by email turned into tickets without retyping them.
license: MIT
metadata:
  author: zapier
  summary: "When a supervisor emails your Outlook HR folder about a change of manager, an HR service request ticket naming the employee and new manager opens in Freshservice, so HR coordinators can process it right away."
  apps: "Microsoft Outlook, AI by Zapier, Freshservice"
  category: "Human Resources (HR)"
  job: "HR operations"
  source: "https://zapier.com/automations/human-resources-hr/hr-operations/hr-case-management/create-change-of-manager-ticket-from-supervisor-email"
---

# Create change of manager ticket from supervisor email

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-change-of-manager-ticket-from-supervisor-email. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new email arrives in the Outlook HR folder that receives supervisor requests (`microsoft-outlook`, `new_email_personal`). The trigger brings the subject and body.
2. **AI by Zapier** reads the subject and body and returns the first and last name of the employee and of their new manager, using only names written in the email.
3. **Freshservice** creates an HR ticket: type Service Request, medium priority, status Open, source Email, in the HR department, filed under the HR requester address. The subject names the employee and new manager, and the description holds both names, the sender and the original email body.

The Zap never invents a name. An email that names neither person creates no ticket.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                | Where                                            | What goes there                                                                                                    |
| ---------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `REPLACE_HR_FOLDER_ID` | `triggers/new-email-personal.ts`, `parentFolder` | The Outlook folder that receives supervisor emails about manager changes. For a subfolder, also set `childFolder`. |
| `HR_REQUESTER_EMAIL`   | `config.ts`                                      | The Freshservice requester address every ticket is filed under. It must already be a requester in Freshservice.    |
| `HR_DEPARTMENT_ID`     | `config.ts`                                      | The HR department in Freshservice: its number from the Department dropdown on Create Ticket.                       |

Also review the defaults with them: `TICKET_PRIORITY` (`Medium`, or `Low`, `High` or `Urgent`) and `TICKET_TYPE` (`Service Request`, or `Incident`).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `microsoft-outlook` (the Outlook account that owns the HR folder; the trigger uses it) and `freshservice` (the help desk account that handles HR cases) to the user's connections. `ai` needs no account of its own: AI by Zapier uses Zapier's managed model credentials, so name it and bind nothing.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-email-personal.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections, and sample one email from the HR folder to confirm the trigger payload carries `id`, `subject` and `body__content`, before the first test run. Fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run (`run_workflow_draft`), with the requester address and department set to real values in the user's Freshservice:

```json
{
  "id": "AAMkAGI2THVSAAA=",
  "subject": "Manager change for Jordan Lee",
  "body__content": "Hi HR, starting Monday Jordan Lee will report to Priya Shah instead of me. Thanks, Sam",
  "from__emailAddress__name": "Sam Rivera",
  "from__emailAddress__address": "sam@example.com"
}
```

Check that one new Freshservice ticket exists with the subject "Change of manager: Jordan Lee to Priya Shah", type Service Request, medium priority, the HR department and the HR requester, and that the description holds both names and the email body. Then run it again with `body__content` set to "Please call me when you have a minute." and check that the run returns `skipped` with reason `no-names-found` and creates no ticket.

If run-status tools aren't available, check the result in Freshservice directly. Ask the user to delete the test ticket; the agent doesn't delete test data. Publish once both runs pass, and confirm the trigger is active.

## Notes

- Freshservice has no search action on Zapier, so the Zap doesn't look up an existing employee record. Every qualifying email opens a new ticket.
- If the AI finds only one of the two people, the ticket still opens and says which name was not found, so a coordinator can fill it in.
- A reply or forward with several names may be parsed less reliably. Keep the HR folder for change-of-manager requests only.
- To screen senders, check `from__emailAddress__address` against a list of supervisor addresses before the AI step. To enrich tickets, add the email's attachments or a related case reference to the Freshservice description.
- Don't commit a real requester address or department ID to the repo.
