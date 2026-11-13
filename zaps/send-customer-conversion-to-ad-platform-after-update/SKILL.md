---
name: send-customer-conversion-to-ad-platform-after-update
description: Build a Zap on Zapier that sends an offline conversion to Google Ads when a HubSpot contact's lifecycle stage is updated to customer, after a 24-hour attribution window. Use when a team wants paid campaigns to count real customers, not just form fills, and runs HubSpot with Google Ads.
license: MIT
metadata:
  author: zapier
  summary: "When a contact becomes a customer in HubSpot, their conversion is sent to Google Ads a day later, so your paid campaigns learn from real sales."
  apps: "HubSpot, Google Ads"
  category: "Marketing"
  job: "Advertising ppc"
  source: "https://zapier.com/automations/marketing/advertising-ppc/google-ads-management/send-customer-conversion-to-ad-platform-after-update"
---

# Send customer conversion to ad platform after update

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-customer-conversion-to-ad-platform-after-update. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a HubSpot contact is updated on its lifecycle stage (`hubspot`, `updated_contact_resthook_v3`, with `property_name` set to `lifecyclestage`).
2. **Filter:** the run continues only if the contact's lifecycle stage is `customer`, and it has a Google click ID or an email. Anything else stops quietly.
3. **Wait:** the run waits 24 hours so the ad click has time to be attributed.
4. **Google Ads** sends an offline conversion to the conversion action you name. It uses the contact's Google click ID when HubSpot has one, and the contact's email otherwise. The conversion time is when the contact was last changed in HubSpot.

## Ask the user

Each `REPLACE_…` value is set per person. Look up names and IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                          | What goes there                                                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_CONVERSION_ACTION_NAME` | The Google Ads conversion action to credit. It must be an "Import from Clicks" action. Ask which one, then look up its name with the user's Google Ads connection.              |
| `REPLACE_GOOGLE_ADS_ACCOUNT_ID`  | The Google Ads account that sends the conversions, digits only. Use the manager account if the conversion action lives there. Look it up with the user's Google Ads connection. |

Also review the defaults with them: `LIFECYCLE_PROPERTY` (`lifecyclestage`) and `CUSTOMER_STAGE` (`customer`) in `config.ts`, and `ATTRIBUTION_DELAY_SECONDS` (24 hours) in `workflow.ts`. Ask whether their HubSpot portal uses the standard lifecycle property and the value `customer` for customers, and change those only if it doesn't.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-ads` to the user's Google Ads connection for the account that owns the conversion action. The trigger uses `hubspot`, the user's HubSpot connection for the portal that holds the contacts.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-contact-resthook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, since it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match. In particular, check the HubSpot contact property names (`lifecyclestage`, `hs_google_click_id`, `email`, `hs_lastmodifieddate`) and the Google Ads identifier field, which depends on the account chosen.

## Test it

Run it once as a draft test with a sample contact that has moved to `customer`:

```json
{
  "id": "1234567",
  "properties": {
    "lifecyclestage": "customer",
    "email": "sample@example.com",
    "hs_google_click_id": "sample-gclid-0001",
    "hs_lastmodifieddate": "2026-11-09T15:00:00.000Z"
  }
}
```

To avoid waiting a day during the test, temporarily set `ATTRIBUTION_DELAY_SECONDS` to a small number, then change it back before publishing.

Check that the run waited before the Google Ads step, and that the step sent one offline conversion to the named conversion action with the click ID as the identifier and the sample's last change as the conversion time. Then run it again with `lifecyclestage` set to any other value, and check that the run stops at the filter and sends nothing. If run-status tools aren't available, check the result in Google Ads directly. The user deletes any test data; the agent doesn't. Then publish, confirm the trigger is active, and give the user the workflow's editor link.

## Notes

- Google Ads only counts a conversion if the click ID or email matches a real ad click or an enhanced-conversions record. Contacts with neither are skipped by the filter.
- The trigger fires on every update to `lifecyclestage`, so a contact that moves to `customer` twice sends two conversions. Add a check against a HubSpot property if that matters.
- To send high-value customers without the wait, skip the delay for records that match a HubSpot property and threshold you choose. To route by market or product, pick the conversion action from the contact's country or product instead of one fixed `CONVERSION_ACTION_NAME`.
- Never commit a real conversion action name or account ID.
