---
name: send-infrastructure-status-updates-to-contacts-in-affected-list
description: Build a Zapier Next Gen Zap that emails a templated infrastructure status update to each contact added to an affected-contacts list in HubSpot, after a short wait. Use when an incident hits infrastructure and support wants every affected contact told at once, without manual sends or a flood of tickets.
metadata:
  author: zapier
  summary: "When a contact is added to your affected-contacts list, they get a short infrastructure status email after a one-minute wait, so people hear from you before they open a ticket."
  apps: "HubSpot, Gmail"
  category: "Executives"
  job: "Crisis incident management"
  source: "https://zapier.com/automations/executives/crisis-incident-management/crisis-communication-distribution/send-infrastructure-status-updates-to-contacts-in-affected-list"
---

# Send infrastructure status updates to contacts in affected list

## What it does

1. **Trigger:** HubSpot, New Contact in List (`new_contact_in_list_resthook_v3`). It fires when a contact is added to the list you choose.
2. **Wait:** one minute, so a batch of additions goes out together.
3. **Skip:** if the contact has no email address, the run stops and sends nothing.
4. **Gmail** sends the status email to the contact's address, with the fixed subject and template in `workflow.ts`.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top.

1. **Trigger:** HubSpot, New Contact in List (`hubspot`, `new_contact_in_list_resthook_v3`). Set `params.list_id` to your HubSpot list ID in the trigger settings, not in the code. Connect a HubSpot account with access to that list. It needs a connection, so its `authentication_id` is that connection's ID.
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the Gmail account that should send the status emails.
3. **Constants:**
   - `DELAY_SECONDS`: how long to wait after a contact is added. Defaults to `60`.
   - `STATUS_SUBJECT`: the email subject.
   - `STATUS_TEMPLATE`: the email body. `{name}` becomes the contact's first name, or "there" when none is set.

No SMS step. The "SMS by Zapier" send action has no recipient field, so it can only text the connected number, not a contact. See `lossy` in the result for the details.

## Ask the user

- Which HubSpot list holds the affected contacts? Set it as `list_id` on the trigger.
- Which HubSpot account should the trigger use, and which Gmail account should send?
- Is the status template right? It is a generic holding message; replace it with the wording the incident team has approved.
- Should contacts with only a phone number be texted instead? That needs a different send step, since SMS by Zapier cannot reach contacts directly.

## Test

The HubSpot trigger has no connection on the account, and the CRM test rule allows a run only on a test or integration connection. To test once one is connected:

1. Run a draft test with this sample input, pointing the email at a mailbox you control:

```json
{
  "id": "12345",
  "properties": {
    "email": "you@example.com",
    "firstname": "Test"
  }
}
```

2. Check that the run waits about a minute, then sends one email with the subject and the body filled in with "Test". Check that the run output has `sent: true` and a message ID.
3. Check that a contact with no email returns `skipped: true` and sends nothing.

Confirm them against a real trigger sample before you publish.

## Customize

- **Send a follow-up reminder three hours later** for unresolved incidents. Not built.
- **Create a support task** for high-severity contacts. Not built.

## Notes

- Nothing is deduplicated. The spec's "not previously contacted for this incident" filter needs stored state the workflow does not have, so a contact added to the list twice gets two emails.
- Test with your own address only. Email goes to whatever address the contact record holds.
