---
name: create-change-of-manager-ticket-from-supervisor-email
description: Build a Zapier Next Gen Zap that watches a Microsoft Outlook HR folder for supervisor emails about a change of manager, uses AI by Zapier to pull out the employee and new manager names, and opens an HR service request ticket in Freshservice. Use when an HR help desk, HR operations or people team runs case management in Freshservice and wants manager change requests sent by email turned into tickets without retyping them.
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

## What it does

1. **Trigger:** a new email arrives in the Microsoft Outlook folder that HR uses for supervisor requests.
2. **AI by Zapier** reads the subject and body and returns the first and last name of the employee and of their new manager, using only names written in the email. If it finds neither person, the run stops and creates nothing.
3. **Freshservice** creates an HR ticket: type Service Request, medium priority, status Open, source Email, in the HR department, filed under the HR requester address. The subject names the employee and new manager, and the description holds both names, the sender and the original email body.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** the files in this folder are the whole zap. `workflow.ts` is the workflow. It imports its settings from `config.ts` and each account from `connections/<alias>.ts`, and `triggers/` holds what starts it.

- **With the zap CLI:** `npx zap-pack add awesome-zaps/create-change-of-manager-ticket-from-supervisor-email` (it makes a zap project if you aren't in one), then `npx zap-pack deploy create-change-of-manager-ticket-from-supervisor-email` from that project. Deploy asks for each open setting and account, and sets the trigger.
- **With Zapier MCP:** publish every `.ts` file outside `triggers/` as `sourceFiles`, with three changes: write `config.ts` as plain values (`export const NAME = "value";`), write each `connections/<alias>.ts` as `export default "<alias>";`, and write each `@/name` import as a relative path ending in `.ts` (`./config.ts`, `./connections/<alias>.ts`). Set the trigger from the file in `triggers/`.

1. **Trigger:** Microsoft Outlook, New Email in Personal Inbox (`microsoft-outlook`, `new_email_personal`). Set `parentFolder` (and `childFolder` for a subfolder) to the HR folder, using the trigger's folder choices. Sample one email from that folder and confirm the payload carries `id`, `subject` and `body__content`; the code falls back to `bodyPreview` when the full body is missing.
2. **Connections** (each alias in the code is the app's slug):
   - `microsoft-outlook`: the Outlook account that owns the HR folder. It is used by the trigger only.
   - `ai`: AI by Zapier. It needs no outside account; the `authentication_id` of `"0"` uses Zapier's managed model credentials.
   - `freshservice`: the Freshservice account for the help desk that handles HR cases.
3. **Constants:**
   - `HR_REQUESTER_EMAIL`: the HR address every ticket is filed under. It must be a requester in Freshservice.
   - `HR_DEPARTMENT_ID`: the HR department's ID, from the `ticket__department_id` choices on Create Ticket.
   - `TICKET_TYPE`: `"Service Request"` by default. The other choice is `"Incident"`.
   - `TICKET_PRIORITY`: `"Medium"` by default. Choices are `Low`, `Medium`, `High` and `Urgent`.
   - `TICKET_STATUS`: Freshservice status code. `2` is Open.
   - `TICKET_SOURCE`: Freshservice source code. `1` is Email.
4. Test with the steps below, then publish and wait until the trigger is active.

## Ask the user

- Which Outlook folder receives the supervisor emails about manager changes?
- Which address should tickets be filed under as the requester? It has to exist as a Freshservice requester.
- Which Freshservice department is HR?
- Is medium priority right, or should these tickets be higher?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, with the requester address and department set to real values in the user's Freshservice:

```json
{
  "id": "AAMkAGI2THVSAAA=",
  "subject": "Manager change for Jordan Lee",
  "body__content": "Hi HR, starting Monday Jordan Lee will report to Priya Shah instead of me. Thanks, Sam",
  "from__emailAddress__name": "Sam Rivera",
  "from__emailAddress__address": "sam@example.com"
}
```

Confirm that one new Freshservice ticket exists with the subject "Change of manager: Jordan Lee to Priya Shah", type Service Request, medium priority, the HR department and the HR requester, and that the description holds both names and the email body. Then tell the user to close or delete the test ticket.

Run it again with a body that names nobody, such as "Please call me when you have a minute.", and confirm the run returns `skipped` with reason `no-names-found` and creates no ticket.

## Customize

- **Only qualifying senders:** check `from__emailAddress__address` against a list of supervisor addresses before the AI step, and skip anyone else.
- **Richer ticket descriptions:** add the email's attachments or a related case reference to the Freshservice description.

## Notes

- Freshservice has no search action on Zapier, so the zap does not look up an existing employee record by name. Every qualifying email opens a new ticket.
- If the AI finds only one of the two people, the ticket still opens and says which name was not found, so a coordinator can fill it in.
- A forwarded or reply email with several names may be parsed less reliably. Keep the HR folder for change-of-manager requests only.
- Never commit a real requester address or department ID. Set them in `config.ts` before deploying.
