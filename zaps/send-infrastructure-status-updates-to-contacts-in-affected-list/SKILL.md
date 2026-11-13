---
name: send-infrastructure-status-updates-to-contacts-in-affected-list
description: Build a Zap on Zapier that emails a templated infrastructure status update to each contact added to an affected-contacts list in HubSpot, after a short wait. Use when an incident hits infrastructure and support wants every affected contact told at once, without manual sends or a flood of tickets.
license: MIT
metadata:
  author: zapier
  summary: "When a contact is added to your affected-contacts list, they get a short infrastructure status email after a one-minute wait, so people hear from you before they open a ticket."
  apps: "HubSpot, Gmail"
  category: "Executives"
  job: "Crisis incident management"
  source: "https://zapier.com/automations/executives/crisis-incident-management/crisis-communication-distribution/send-infrastructure-status-updates-to-contacts-in-affected-list"
---

# Send infrastructure status updates to contacts in affected list

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-infrastructure-status-updates-to-contacts-in-affected-list. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a contact is added to the affected-contacts list in HubSpot (`hubspot`, `new_contact_in_list_resthook_v3`).
2. **Wait:** one minute, so a batch of additions goes out together.
3. **Skip:** if the contact has no email address, the run stops and sends nothing.
4. **Gmail** sends the status email to the contact's address, with the subject and template in the Zap's code.

The Zap never sends to a contact without an email address, and never texts anyone.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting           | Where                                                        | What goes there                                   |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------- |
| `REPLACE_LIST_ID` | `triggers/new-contact-in-list-resthook.ts`, `params.list_id` | The HubSpot list that holds the affected contacts |

Also review the defaults with them: `STATUS_SUBJECT` (`config.ts`, the email subject), and `STATUS_TEMPLATE` and `DELAY_SECONDS` (top of `workflow.ts`). The template is a generic holding message; replace it with the wording the incident team has approved.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` to the Gmail account that should send the status emails. The HubSpot trigger uses `hubspot`, which needs a HubSpot connection with access to the affected-contacts list; bind it to that connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-contact-in-list-resthook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

The HubSpot trigger needs a test or integration connection to run in a draft test. Run it once as a draft test with this sample input, pointing the email at a mailbox you control:

```json
{
  "id": "12345",
  "properties": {
    "email": "you@example.com",
    "firstname": "Test"
  }
}
```

Check that the run waits about a minute, then sends one email with the subject and the body filled in with "Test". Check that the run output has `sent: true` and a message ID. Then run a contact with no email address and check that it returns `skipped: true` and sends nothing. If run-status tools aren't available, check the result in Gmail directly. Ask the user to delete the test email; the agent doesn't delete it. Confirm the sample against a real trigger sample before you publish, then confirm the trigger is active.

## Notes

- Nothing is deduplicated. A contact added to the list twice gets two emails, because the Zap keeps no record of who it has already contacted.
- Test with your own address only. Email goes to whatever address the contact record holds.
- Not built: a follow-up reminder three hours later, a support task for high-severity contacts, and texting contacts who have only a phone number (the SMS send action can only reach the connected number). Add them as steps after the email.
