---
name: create-termination-letter-and-save-to-client-folder
description: Build a Zap on Zapier that turns a termination request posted to a webhook into a filled-in termination letter, saved as a Google Doc in the client's Drive folder and ready for review. Use when a legal or practice-admin team generates termination letters from a template and wants the letter created and filed automatically.
license: MIT
metadata:
  author: zapier
  summary: "When a termination request comes in, a termination letter is filled in from your template and saved to the client's folder, ready for review."
  apps: "Webhooks by Zapier, Google Docs"
  category: "Legal"
  job: "Legal document automation"
  source: "https://zapier.com/automations/legal/legal-document-automation/legal-letter-generation/create-termination-letter-and-save-to-client-folder"
---

# Create termination letter and save to client folder

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-termination-letter-and-save-to-client-folder. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a termination request arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). A practice system, form or script posts to it. The payload carries the client folder's Drive URL and the letter's fields.
2. **Code** pulls the Drive folder ID out of `folder_path` and stamps the current time.
3. **Google Docs** copies the termination template into that folder, fills in the template fields (termination date, provider, practice, address, credential and tax references) and names the document with the practice, provider and time. Fields with no value are left as their `{{placeholder}}`.

The Zap only creates the letter as a private document for review. It sends nothing to the client.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                   | What goes there                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_TEMPLATE_DOC_ID` | The Google Doc used as the termination template. Pick it from the user's Google Docs connection; it is `TEMPLATE_DOC_ID` in `config.ts` |

Also review the default with them: `TITLE_PREFIX` (`"Termination letter"`; the practice, provider and time are appended). If the payload has no `termination_date`, the letter uses today's date.

Confirm before building:

- Does the sending system name its fields `folder_path`, `provider_name`, `practice_name`, `practice_address`, `credential_ref`, `tax_ref` and `termination_date`? If not, rename them in `workflow.ts`.
- Is the client folder in the connected account's My Drive or a shared drive? The account needs write access to it.
- Does the template have these placeholders, spelled exactly: `{{termination_date}}`, `{{provider_name}}`, `{{practice_name}}`, `{{practice_address}}`, `{{credential_ref}}`, `{{tax_ref}}`? Keep the names or change them in the code.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-docs` to the user's Google Docs connection for the Google account that owns the template and the client folders. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with `REPLACE_TEMPLATE_DOC_ID` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run before publishing, with a folder the connected account can write to. Use this sample, not real client data:

```json
{
  "folder_path": "https://drive.google.com/drive/folders/TEST_FOLDER_ID",
  "provider_name": "Dr. Test Provider",
  "practice_name": "Test Practice",
  "practice_address": "1 Test Street, New York, NY",
  "credential_ref": "CRED-000",
  "tax_ref": "TAX-000",
  "termination_date": "October 31, 2026"
}
```

Check that the run completes, a new document is in the folder with the title built from the practice and provider, and the document's text shows each value in place of its placeholder. If run-status tools aren't available, check the result in Google Docs directly. Then ask the user to delete the test document; the agent does not delete it.

## Notes

- The new document is private to the connected account until someone shares it. Google Docs keeps any unused placeholder as written, so check the letter before it goes out.
- Once the trigger is active, give the user the webhook URL to point their practice system at. Anyone with that URL can create letters in the connected account, so share it only with the sending system.
- To convert the letter to PDF and attach it to the client's CRM record, add a step after the letter is created that exports it and attaches it. To add legal review, route each new document to a review channel and wait for approval before anyone sends it.
