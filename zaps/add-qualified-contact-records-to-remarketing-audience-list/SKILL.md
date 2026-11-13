---
name: add-qualified-contact-records-to-remarketing-audience-list
description: Build a Zap on Zapier that adds a contact to a Google Ads customer list when a qualifying row is added to a Zapier Table, normalizing the email and carrying the consent flag. Use when a team qualifies contacts in a table or sheet and wants them pushed into a Google Ads remarketing audience without manual uploads.
license: MIT
metadata:
  author: zapier
  summary: "When a new client row reaches a qualifying case status, that contact is added to your Google Ads remarketing list so you can reach them with timely ads."
  apps: "Zapier Tables, Google Ads"
  category: "Marketing"
  job: "Advertising ppc"
  source: "https://zapier.com/automations/marketing/advertising-ppc/retargeting-audience-management/add-qualified-contact-records-to-remarketing-audience-list"
---

# Add qualified contact records to remarketing audience list

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/add-qualified-contact-records-to-remarketing-audience-list. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new record is added to your Zapier Table (`zapier-tables`, `new_record`). The record's email, ad consent and case status are read from the row.
2. **Filter:** if the case status is not one of your qualifying statuses, the run stops and nothing is uploaded.
3. **Normalize:** the email is trimmed and lowercased. Consent becomes `CONSENT_GRANTED` when the consent field is true, otherwise `CONSENT_DENIED`.
4. **Google Ads** adds the email to your customer list, with the ad user data and personalization consent flags set from step 3.

A row without consent is still uploaded, marked `CONSENT_DENIED`, so confirm your consent policy before you turn the Zap on.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                         | Where                                | What goes there                                                              |
| ------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| `REPLACE_TABLE_ID`              | `triggers/new-record.ts`, `table_id` | The Zapier Table that receives the contact rows; each new row is one contact |
| `REPLACE_GOOGLE_ADS_ACCOUNT_ID` | `config.ts`                          | The Google Ads account that owns the customer list (its customer ID)         |
| `REPLACE_CUSTOMER_LIST_ID`      | `config.ts`                          | The numeric ID of the Google Ads customer list the contacts are added to     |

Also review the defaults with them:

- `CASE_STATUSES` in `workflow.ts`: defaults to `["Qualified"]`, the only status that qualifies a row. Change it to the statuses the team uses.
- The table fields the code reads: `f1` (email), `f2` (ad consent, true or false) and `f3` (case status). Rename them in `workflow.ts` if the table differs.

Confirm the Google Ads account can edit that customer list. Using the wrong list adds contacts to an audience you did not mean to target.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-ads` to the user's Google Ads connection for the account that owns the customer list, and `zapier-tables` to the user's Zapier Tables connection for the table. The trigger uses `zapier-tables`; no other step needs an account.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-record.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run first. It uses no real data, and the row's status does not qualify, so the run stops at the filter and uploads nothing:

```json
{
  "id": "01M651KRN7GPH9WSEVQ44RGHAR",
  "data": { "f1": "test@example.com", "f2": false, "f3": "Lead" }
}
```

Expect `{ "skipped": true, "reason": "status-not-qualifying" }` and no Google Ads call. Then test with a qualifying row (`f3: "Qualified"`) only against a Google Ads test account and customer list, and check that the contact appears in that list. If run-status tools aren't available, check the result in Google Ads directly. Then publish and confirm the trigger is active. The user deletes any test rows afterward, not the agent.

## Notes

- Google Ads needs a real customer list ID and a connected account with permission to edit it. Using the wrong list adds contacts to an audience you did not mean to target.
- Google matches contacts on email; the Zap does no separate lookup.
- To tag the contact in your CRM or alert the campaign team in Slack, add a step after the Google Ads step.
