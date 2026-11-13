---
name: create-ad-conversion-events-for-new-list-contacts
description: Build a Zap on Zapier that sends a LinkedIn Conversions API event each time a contact is added to a HubSpot list, so ad campaigns get timely attribution. Use when a marketing team adds contacts to a HubSpot list and wants each addition counted as a LinkedIn conversion.
license: MIT
metadata:
  author: zapier
  summary: "When a contact joins your HubSpot marketing list, LinkedIn gets a conversion event for them, so campaigns can credit the sign-up."
  apps: "HubSpot, LinkedIn Conversions"
  category: "Marketing"
  job: "Marketing analytics"
  source: "https://zapier.com/automations/marketing/marketing-analytics/marketing-attribution/create-ad-conversion-events-for-new-list-contacts"
---

# Create ad conversion events for new list contacts

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-ad-conversion-events-for-new-list-contacts. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** HubSpot, New Contact in List (`hubspot`, `new_contact_in_list_resthook_v3`). It fires when a contact is added to the list in `HUBSPOT_LIST_ID`, and asks HubSpot for the email, first name, last name and company.
2. **Plain code:** trims and lowercases the email and skips the run if there is none. It sends name and company only when both first and last name are present, because LinkedIn requires the name pair.
3. **LinkedIn Conversions:** sends one conversion event (`create_conversion_event`) for the contact to the ad account and conversion in the settings. The HubSpot contact ID is the event ID, so a retried list add does not create a second event.

The Zap only sends conversion events. It never changes the contact or the list.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | Where                                                                    | What goes there                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `HUBSPOT_LIST_ID`        | `config.ts`, and `list_id` in `triggers/new-contact-in-list-resthook.ts` | The HubSpot list whose additions create conversion events                                                              |
| `LINKEDIN_ACCOUNT_ID`    | `config.ts`                                                              | The LinkedIn ad account that owns the conversion                                                                       |
| `LINKEDIN_CONVERSION_ID` | `config.ts`                                                              | The Conversions API conversion that receives each event. Create one in Campaign Manager first if the dropdown is empty |

Also ask the user before building: should the Zap run against a HubSpot test portal and a LinkedIn test account first? Use a test or sandbox portal if one exists.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `linkedin-conversions` to the user's LinkedIn connection for the ad account that receives the events. Bind `hubspot` to the HubSpot connection for the portal that owns the list; the trigger uses it. No other apps need a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-contact-in-list-resthook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run before publishing, with a test contact on a test list:

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

Check that one conversion event reached the chosen LinkedIn conversion with the lowercased email, the name fields and `event_id` 123456789. If run-status tools aren't available, check the result in LinkedIn Campaign Manager directly. Do not run this against a live ad account, and do not use real contacts. The user deletes test data, not the agent: have them remove the test contact from the list.

## Notes

- Name and company are sent only when both first and last name are present; otherwise only the email and event ID are sent.
- The HubSpot property names (`firstname`, `lastname`, `company`) follow HubSpot's standard names.
- To send events only for paid-campaign list additions, add a conditional step before the conversion.
- To add UTM tags or campaign metadata to each event, add them to the event before it is sent.
- Keep real list, ad account and conversion IDs out of committed files.
