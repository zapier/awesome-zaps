---
name: create-ad-conversion-events-for-new-list-contacts
description: Build a Zapier Next Gen Zap that sends a LinkedIn Conversions API event each time a contact is added to a HubSpot list, so ad campaigns get timely attribution. Use when a marketing team adds contacts to a HubSpot list and wants each addition counted as a LinkedIn conversion.
metadata:
  author: zapier
  summary: "When a contact joins your HubSpot marketing list, LinkedIn gets a conversion event for them, so campaigns can credit the sign-up."
  apps: "HubSpot, LinkedIn Conversions"
  category: "Marketing"
  job: "Marketing analytics"
  source: "https://zapier.com/automations/marketing/marketing-analytics/marketing-attribution/create-ad-conversion-events-for-new-list-contacts"
---

# Create ad conversion events for new list contacts

## What it does

1. **Trigger:** HubSpot, New Contact in List (`new_contact_in_list_resthook_v3`). It fires when a contact is added to the list named in `HUBSPOT_LIST_ID`, and asks HubSpot for the email, first name, last name and company.
2. **Plain code:** trims and lowercases the email and skips the run if there is none. It sends name and company only when both first and last name are present, because LinkedIn requires the name pair.
3. **LinkedIn Conversions:** sends one conversion event (`create_conversion_event`) for the contact to the account and conversion set in the constants. The HubSpot contact ID is the event ID, so a retried list add does not create a second event.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** HubSpot, New Contact in List. Set `list_id` to the list and pass `properties_to_retrieve` as `["email", "firstname", "lastname", "company"]`. HubSpot needs a connection here.
2. **Connections** (each alias in the code is the app's slug):
   - `hubspot`: the HubSpot connection for the portal that owns the list. Use a test or sandbox portal if one exists.
   - `linkedin-conversions`: the LinkedIn connection for the ad account.
3. **Constants:**
   - `HUBSPOT_LIST_ID`: the list ID from the HubSpot list's URL.
   - `LINKEDIN_ACCOUNT_ID`: the LinkedIn ad account, picked from the account dropdown on the action.
   - `LINKEDIN_CONVERSION_ID`: a Conversions API conversion in that account, picked from the conversion dropdown. Create one in Campaign Manager first if the dropdown is empty.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook details if the trigger shows one (HubSpot uses its own subscription, so usually none).

## Ask the user

- Which HubSpot list should trigger conversions, and which LinkedIn ad account and Conversions API conversion should receive them?
- Should the Zap run against a HubSpot test portal and a LinkedIn test account first?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a test contact, and have the trigger's list be a test list:

```json
{
  "id": "123456789",
  "properties": {
    "email": "  Test.Person@example.com ",
    "firstname": "Test",
    "lastname": "Person",
    "company": "Example Co"
  }
}
```

Check that one conversion event reached the chosen LinkedIn conversion with the lowercased email, the name fields and `event_id` 123456789. Then remove the test contact from the list. Real contacts should not be used for this test. Do not run this against a live ad account.

## Customize

- **Paid-campaign only:** add a conditional step that sends events only for paid-campaign list additions.
- **Enrich the payload:** add UTM tags or campaign metadata to the event before sending.

## Notes

- Name and company are sent only when both first and last name are present; otherwise only the email and event ID are sent.
- The HubSpot property names (`firstname`, `lastname`, `company`) follow HubSpot's standard names.
- Never commit a real list ID, ad account ID or conversion ID.
