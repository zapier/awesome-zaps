---
name: add-qualified-contact-records-to-remarketing-audience-list
description: Build a Zapier Next Gen Zap that adds a contact to a Google Ads customer list when a qualifying row is added to a Zapier Table, normalizing the email and carrying the consent flag. Use when a team qualifies contacts in a table or sheet and wants them pushed into a Google Ads remarketing audience without manual uploads.
metadata:
  author: zapier
  summary: "When a new client row reaches a qualifying case status, that contact is added to your Google Ads remarketing list so you can reach them with timely ads."
  apps: "Zapier Tables, Google Ads"
  category: "Marketing"
  job: "Advertising ppc"
  source: "https://zapier.com/automations/marketing/advertising-ppc/retargeting-audience-management/add-qualified-contact-records-to-remarketing-audience-list"
---

# Add qualified contact records to remarketing audience list

## What it does

1. **Trigger:** a new record is added to your Zapier Table. The record's email, ad consent and case status are read from the row.
2. **Filter:** if the case status is not one of your qualifying statuses, the run stops and nothing is uploaded.
3. **Normalize:** the email is trimmed and lowercased. Consent becomes `CONSENT_GRANTED` when the consent field is true, otherwise `CONSENT_DENIED`.
4. **Google Ads** adds the email to your customer list, with the ad user data and personalization consent flags set from step 3.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Zapier Tables, New Record (`zapier-tables` / `new_record`). Params: `table_id` = `TABLE_ID`. Authentication is the Zapier Tables connection.
2. **Connections** (each alias in the code is the app's slug):
   - `google-ads`: the user's Google Ads connection, for the account that owns the customer list. Action: `add_email_to_customer_list_v3`.
   - `zapier-tables`: the trigger's Zapier Tables connection.
3. **Constants:**
   - `TABLE_ID`: the Zapier Table that receives the contact rows.
   - `GOOGLE_ADS_ACCOUNT_ID`: the Google Ads account ID the upload acts as.
   - `CUSTOMER_LIST_ID`: the numeric ID of the customer list to add contacts to.
   - `CASE_STATUSES`: the case-status values that qualify a row. Defaults to `["Qualified"]`.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the trigger's webhook details if any are shown.

## Ask the user

- Which Zapier Table is the contact table, and which fields hold the email, the ad consent flag and the case status? The code reads them as `f1` (email), `f2` (consent, true/false) and `f3` (case status); rename them if the table differs.
- Which case statuses qualify? The default is `Qualified` only.
- Which Google Ads account and customer list should receive the contacts?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a test table row whose status does not qualify, so the run stops at the filter and uploads nothing:

```json
{
  "id": "01M651KRN7GPH9WSEVQ44RGHAR",
  "data": { "f1": "test@example.com", "f2": false, "f3": "Lead" }
}
```

Expect `{ "skipped": true, "reason": "status-not-qualifying" }` and no Google Ads call. Then test with a qualifying row (`f3: "Qualified"`) only against a Google Ads test account and customer list, and check in Google Ads that the contact appears in that list. Remove any test rows afterward.

## Customize

- **CRM tag:** add a CRM update step after the Google Ads step to tag the contact in your CRM.
- **Campaign alert:** send an internal Slack or email alert for each uploaded contact, so the campaign team can see it.

## Notes

- Google Ads needs a real customer list ID and a connected account with permission to edit it. Using the wrong list adds contacts to an audience you did not mean to target.
- Only consent-flagged contacts should be used for remarketing. The code sends `CONSENT_DENIED` for rows without consent rather than skipping them, so check your consent policy before you go live.
- The Google Ads add step adds the contact to the list; matching on email is handled by Google, not by a separate lookup.
