---
name: send-customer-conversion-to-ad-platform-after-update
description: Build a Zapier Next Gen Zap that sends an offline conversion to Google Ads when a HubSpot contact's lifecycle stage is updated to customer, after a 24-hour attribution window. Use when a team wants paid campaigns to count real customers, not just form fills, and runs HubSpot with Google Ads.
metadata:
  author: zapier
  summary: "When a contact becomes a customer in HubSpot, their conversion is sent to Google Ads a day later, so your paid campaigns learn from real sales."
  apps: "HubSpot, Google Ads"
  category: "Marketing"
  job: "Advertising ppc"
  source: "https://zapier.com/automations/marketing/advertising-ppc/google-ads-management/send-customer-conversion-to-ad-platform-after-update"
---

# Send customer conversion to ad platform after update

## What it does

1. **Trigger:** a HubSpot contact is updated on its lifecycle stage (HubSpot, Contact Property Change, `lifecyclestage`).
2. **Filter:** the run continues only if the contact's lifecycle stage is `customer`. Anything else stops quietly.
3. **Wait:** the run waits 24 hours so the ad click has time to be attributed.
4. **Google Ads** sends an offline conversion to the conversion action you name. It uses the contact's Google click ID when HubSpot has one, and the contact's email otherwise. The conversion time is when the contact was last changed in HubSpot.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first run. In particular, check the HubSpot contact property names (`lifecyclestage`, `hs_google_click_id`, `email`, `hs_lastmodifieddate`) and the Google Ads identifier field, which depends on the account chosen.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** HubSpot, New Contact Property Change (`updated_contact_resthook_v3`), with `property_name` set to `lifecyclestage`. It needs the user's HubSpot connection.
2. **Connections** (each alias in the code is the app's slug):
   - `hubspot`: the user's HubSpot connection, for the portal that holds the contacts.
   - `google-ads`: the user's Google Ads connection, for the account that owns the conversion action.
3. **Constants:**
   - `CONVERSION_ACTION_NAME`: the name of the Google Ads conversion action to credit. It must be an "Import from Clicks" action.
   - `GOOGLE_ADS_ACCOUNT_ID`: the Google Ads account to send from. Use the manager account ID if the conversion action lives there.
   - `LIFECYCLE_PROPERTY` and `CUSTOMER_STAGE`: change these only if the user's HubSpot uses a custom lifecycle property or a different value for customers.
   - `ATTRIBUTION_DELAY_SECONDS`: the wait before sending. Defaults to 24 hours.
4. Publish once the checks pass, wait until the trigger is active, and give the user the workflow's editor link.

## Ask the user

- Which Google Ads conversion action should receive these conversions? Its name goes in `CONVERSION_ACTION_NAME`.
- Which Google Ads account should send them? Use the manager account if the conversion action is there.
- Does the HubSpot portal use the standard `lifecyclestage` property and the value `customer` for customers?
- Should customers in a particular market or product go to a different conversion action? (Not built here; see Customize.)

## Test

Use a contact that exists in the user's HubSpot portal and is safe to change. Set its lifecycle stage to `customer`, then check the run in Zapier:

- The trigger fired for that contact, and the run waited about 24 hours before the Google Ads step.
- The Google Ads step sent one offline conversion to the named conversion action, with the contact's click ID or email as the identifier and the conversion time set to the contact's last change.
- Set the contact's lifecycle stage to any other value. Confirm the run stops at the filter and sends nothing to Google Ads.

To test without waiting a day, temporarily set `ATTRIBUTION_DELAY_SECONDS` to a small number, then change it back before publishing.

## Customize

- **Send immediately for high-value customers:** skip the 24-hour wait for high-value customer records, using a HubSpot property and threshold you choose.
- **Route by market or product:** pick the Google Ads conversion action from the contact's country or product, instead of one fixed `CONVERSION_ACTION_NAME`.

## Notes

- Google Ads only counts a conversion if the click ID or email matches a real ad click or an enhanced-conversions record. Contacts with neither are skipped by the filter logic above.
- The HubSpot trigger fires on every update to `lifecyclestage`, so a contact that moves to `customer` twice will send two conversions. Add a check against a HubSpot property if that matters.
- Never commit a real conversion action name, account ID or webhook URL.
