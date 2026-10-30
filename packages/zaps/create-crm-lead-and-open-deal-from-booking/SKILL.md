---
name: create-crm-lead-and-open-deal-from-booking
description: Build a Zapier Next Gen Zap that adds a Calendly booking attendee to Pipedrive as a person and opens a deal for them in the incoming stage, owned by the configured user. Use when a coaching, consulting or sales call is booked through Calendly and the sales team wants each attendee in the CRM with an open deal to follow up on.
metadata:
  author: zapier
  summary: "When someone books a call through Calendly, they are added to your Pipedrive as a contact and an open deal is created for your rep to follow up on."
  apps: "Calendly, Pipedrive"
  category: "Sales"
  job: "CRM management"
  source: "https://zapier.com/automations/sales/crm-management/contact-management/create-crm-lead-and-open-deal-from-booking"
---

# Create CRM lead and open deal from booking

## What it does

1. **Trigger:** a Calendly invitee is created (someone books or reschedules an event) for the user's Calendly account.
2. **Filter:** the run continues only when the event name contains the qualifying text (default: "coaching session"). Other bookings stop here and write nothing.
3. **Pipedrive** creates a person from the invitee's name, email and phone.
4. **Pipedrive** creates an open deal titled `<event name>: <invitee name>`, linked to that person, in the incoming stage and owned by the configured user.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run. The Calendly payload keys (`invitee_name`, `invitee_email`, `invitee_phone`, `event_name`) must be checked against a real invitee payload.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Calendly, Invitee Created or Rescheduled (`calendly`, `invitee_created`), with webhook subscription scope `user`. The trigger needs the user's Calendly connection, so bind it before publishing.
2. **Connections** (each alias in the code is the app's slug):
   - `calendly`: the user's Calendly connection, used by the trigger.
   - `pipedrive`: the user's Pipedrive connection.
3. **Constants:**
   - `EVENT_NAME_MATCH`: text the event name must contain. Defaults to `"coaching session"`. Set it to `""` to accept every event.
   - `INCOMING_STAGE_ID`: the numeric ID of the Pipedrive stage new deals open in. It is `0` in this file and must be set.
   - `OWNER_ID`: the numeric ID of the Pipedrive user who owns new deals. It is `0` in this file and must be set.

## Ask the user

- Which Calendly event names qualify? The default is "coaching session"; set `EVENT_NAME_MATCH` to match their event names.
- Which Pipedrive stage should new deals open in, and which Pipedrive user should own them? Set `INCOMING_STAGE_ID` and `OWNER_ID` to their IDs.
- Do the Calendly payload keys match? Send one real booking through the trigger and confirm `invitee_name`, `invitee_email`, `invitee_phone` and `event_name` are the keys the payload uses. Change the names in the input schema if not.

## Test

Run this sample as a draft test run before publishing, against a Pipedrive test account:

```json
{
  "invitee_name": "Jane Example",
  "invitee_email": "jane.example@example.com",
  "invitee_phone": "+1 555 0100",
  "event_name": "Coaching Session"
}
```

Check that:

- A Pipedrive person named "Jane Example" exists with that email and phone.
- A new open deal titled "Coaching Session: Jane Example" exists, linked to that person, in the incoming stage and owned by the configured user.
- A sample with an `event_name` that does not contain the qualifying text, such as "Discovery Call", stops at the filter and writes nothing.

Then delete the test person and deal in Pipedrive.

## Customize

- **Tag contacts by program or cohort:** add a step after the deal that adds a label to the person, based on the event name.
- **Notify a team channel for high-value bookings:** add a Slack message step after the deal, for deals above a value threshold.

## Notes

- Pipedrive's Create Person does not take an owner, so the owner is set on the deal only.
- A new person is created on every qualifying booking. This flow does not first search Pipedrive by email, so an attendee who books twice gets two people.
- The deal value is not set, so Pipedrive records it as 0.
- Only the event name is used to qualify a booking, not Calendly's event type ID.
- Never commit a real Pipedrive stage or owner ID, a real email address, or a webhook URL.
