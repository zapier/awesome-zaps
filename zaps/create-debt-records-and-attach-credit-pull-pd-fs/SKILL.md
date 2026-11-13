---
name: create-debt-records-and-attach-credit-pull-pd-fs
description: Build a Zap on Zapier that receives a credit-pull request at a webhook and requests the client's credit report from your credit-report API, so its PDF is captured without a manual pull. Use when accounts receivable teams pull credit reports on new clients by hand.
license: MIT
metadata:
  author: zapier
  summary: "When a credit pull request comes in, the credit report is requested and its PDF captured, so the client's file is ready without manual pulls."
  apps: "Webhooks by Zapier"
  category: "Finance"
  job: "Accounts receivable"
  source: "https://zapier.com/automations/finance/accounts-receivable/credit-management/create-debt-records-and-attach-credit-pull-pd-fs"
---

# Create debt records and attach credit pull PDFs

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-debt-records-and-attach-credit-pull-pd-fs. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a credit-pull request arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). A CRM or intake form posts the client's details to it.
2. **Webhooks by Zapier** sends the client's identity and contact fields to your credit-report API. The response is meant to carry the report's PDF.
3. If no report comes back, the run stops and says so.

The SSN and date of birth go only to the credit API.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting           | What goes there                                                                                                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CREDIT_PULL_URL` | The endpoint of the user's credit-report API, which receives the pull request. The spec doesn't name a provider, and the request format and the response field that carries the PDF must match theirs |

Also review the default with them: `DEFAULT_COUNTRY_CODE` (`+1`) is added to 10-digit phone numbers; change it for non-US clients.

Before the Drive and HubSpot steps are added, ask which Google Drive folder should hold the PDFs, and which CRM (HubSpot, Salesforce or other) holds the debt records.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** none. The catch hook and the POST step need no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` is a setting, not code: set the workflow's trigger from it. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the POST action's fields and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a fake client that has no real identity data:

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

Check that the POST reached the credit API with these fields, and that the run stops with `credit-pull-returned-no-report` if the response has no report. If run-status tools aren't available, check the result in your credit-report API directly. Then publish, confirm the trigger is active, and give the user the webhook URL to point their intake system at. The user deletes any test data, not the agent.

## Notes

- **Not built:** the Google Drive PDF upload and the HubSpot deal update. HubSpot has no connection. Both steps need a connection and an enabled action before they can be added.
- **Not built:** the Zapier Tables lookup for the credit API key. Keep that key in a secret store, not in the workflow source.
- Never commit a real credit API URL or any credentials. Anyone with the webhook URL can start a credit pull.
- To extend it: notify the team on failed pulls or missing tokens with a Slack or email step after the credit-pull step, or create a case-manager task for debts above a threshold with a step that compares the debt total to a limit.
