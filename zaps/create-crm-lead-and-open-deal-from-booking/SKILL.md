---
name: create-crm-lead-and-open-deal-from-booking
description: Build a Zap on Zapier that adds a Calendly booking attendee to Pipedrive as a person and opens a deal for them in the incoming stage, owned by the configured user. Use when a coaching, consulting or sales call is booked through Calendly and the sales team wants each attendee in the CRM with an open deal to follow up on.
license: MIT
metadata:
  author: zapier
  summary: "When someone books a call through Calendly, they are added to your Pipedrive as a contact and an open deal is created for your rep to follow up on."
  apps: "Calendly, Pipedrive"
  category: "Sales"
  job: "CRM management"
  source: "https://zapier.com/automations/sales/crm-management/contact-management/create-crm-lead-and-open-deal-from-booking"
---

# Create CRM lead and open deal from booking

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-crm-lead-and-open-deal-from-booking. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Calendly invitee is created (someone books or reschedules an event) for the user's Calendly account (`calendly`, `invitee_created`).
2. **Filter:** the run continues only when the event name contains the qualifying text (default: "coaching session"). Other bookings stop here and write nothing.
3. **Pipedrive** creates a person from the invitee's name, email and phone.
4. **Pipedrive** creates an open deal titled `<event name>: <invitee name>`, linked to that person, in the incoming stage and owned by the configured user.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own Pipedrive connection; don't ask them to paste an ID you can look up.

| Setting             | What goes there                                         |
| ------------------- | ------------------------------------------------------- |
| `INCOMING_STAGE_ID` | The numeric ID of the Pipedrive stage new deals open in |
| `OWNER_ID`          | The numeric ID of the Pipedrive user who owns new deals |

Also review the default with them: `EVENT_NAME_MATCH` (`"coaching session"`) is the text a Calendly event name must contain. Set it to the names they use, or to `""` to accept every event.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `calendly` (the user's Calendly account; the trigger uses it) and `pipedrive` (the user's Pipedrive connection) to the user's connections. No other apps are used.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/invitee-created.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match. Check that the Calendly payload uses `invitee_name`, `invitee_email`, `invitee_phone` and `event_name`.

## Test it

Run this sample as a draft test before publishing, against a Pipedrive test account:

```json
{
  "invitee_name": "Jane Example",
  "invitee_email": "jane.example@example.com",
  "invitee_phone": "+1 555 0100",
  "event_name": "Coaching Session"
}
```

Check that one person named "Jane Example" exists with that email and phone, and that one open deal titled "Coaching Session: Jane Example" is linked to that person, in the incoming stage and owned by the configured user. Then run a sample whose `event_name` is "Discovery Call": it should stop at the filter and write nothing. If run-status tools aren't available, check the result in Pipedrive directly. Ask the user to delete the test person and deal, not the agent.

## Notes

- Pipedrive's Create Person does not take an owner, so the owner is set on the deal only. The deal value is not set, so Pipedrive records it as 0.
- A new person is created on every qualifying booking, so an attendee who books twice gets two people.
- Only the event name qualifies a booking, not Calendly's event type ID.
- To tag contacts by program, add a step after the deal that labels the person from the event name. To alert a team channel on large bookings, add a Slack step after the deal.
- Don't commit real Pipedrive stage or owner IDs, email addresses or webhook URLs.
