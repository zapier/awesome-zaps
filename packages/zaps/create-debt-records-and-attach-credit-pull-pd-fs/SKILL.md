---
name: create-debt-records-and-attach-credit-pull-pd-fs
description: Use when a credit-pull request arrives by webhook and you want the credit report requested and its PDF captured, with the client's debt records created in your CRM and the PDF stored in Drive. Use it when accounts receivable teams pull credit reports on new clients and file them by hand.
metadata:
  author: zapier
  summary: "When a credit pull request comes in, the credit report is requested and its PDF captured, so the client's file is ready without manual pulls."
  apps: "Webhooks by Zapier"
  category: "Finance"
  job: "Accounts receivable"
  source: "https://zapier.com/automations/finance/accounts-receivable/credit-management/create-debt-records-and-attach-credit-pull-pd-fs"
---

# Create debt records and attach credit pull PDFs

## What it does

1. **Trigger:** a credit-pull request arrives at a Webhooks by Zapier catch hook (a CRM or intake form posts the client's details to it).
2. **Webhooks by Zapier (POST)** sends the client's identity and contact fields to your credit-report API. The response is meant to carry the report's PDF.
3. If no report comes back, the run stops and says so.

The spec also has the PDF uploaded to Google Drive and a HubSpot deal updated with the client's credit fields. Those steps are not built yet (see Notes).

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections:** none bound in this draft. The Drive and HubSpot steps will need their own connections when they are added.
3. **Constants:**
   - `CREDIT_PULL_URL`: the endpoint of your credit-report API. Replace `YOUR_CREDIT_PULL_API_URL`.
   - `DEFAULT_COUNTRY_CODE`: added to 10-digit phone numbers. Defaults to `+1`.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point their intake system at.

## Ask the user

- Which credit-report provider and endpoint? The request format and the response field that carries the PDF must match it.
- Which Google Drive folder should hold the PDFs, and which CRM (HubSpot, Salesforce or other) holds the debt records?
- Should phone numbers default to a country code other than `+1`?

## Test

When you test, use a fake client with no real identity data, in this shape:

```json
{
  "client_id": "TEST-0001",
  "first_name": "Test",
  "last_name": "Client",
  "ssn": "000-00-0000",
  "dob": "1990-01-01",
  "address": "1 Example St, Testville",
  "phone": "555-0100"
}
```

Check that the POST reached the credit API with these fields, and that the run stops cleanly if the response has no report. The Drive and HubSpot checks come after those steps are built.

## Customize

- **Notify the team** on failed pulls or missing tokens: add a Slack or email step after the credit-pull step.
- **Create a case-manager task** for debts above a threshold: add a step after the HubSpot update that compares the debt total to a configured limit.

## Notes

- **Not built:** the Google Drive PDF upload and the HubSpot deal update. HubSpot has no connection. Both steps need a connection and an enabled action before they can be added.
- **Not built:** the Zapier Tables lookup for the credit API key. Keep that key in a secret store, not in the workflow source.
- The client's SSN and date of birth are sent to the credit API only. They are not written to Drive or to step output.
- Never commit a real credit API URL or any credentials. Anyone with the webhook URL can start a credit pull.
