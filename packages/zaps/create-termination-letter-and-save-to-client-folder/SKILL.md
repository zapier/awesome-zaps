---
name: create-termination-letter-and-save-to-client-folder
description: Build a Zapier Next Gen Zap that turns a termination request posted to a webhook into a filled-in termination letter, saved as a Google Doc in the client's Drive folder and ready for review. Use when a legal or practice-admin team generates termination letters from a template and wants the letter created and filed automatically.
metadata:
  author: zapier
  summary: "When a termination request comes in, a termination letter is filled in from your template and saved to the client's folder, ready for review."
  apps: "Webhooks by Zapier, Google Docs"
  category: "Legal"
  job: "Legal document automation"
  source: "https://zapier.com/automations/legal/legal-document-automation/legal-letter-generation/create-termination-letter-and-save-to-client-folder"
---

# Create termination letter and save to client folder

## What it does

1. **Trigger:** a termination request arrives at a Webhooks by Zapier catch hook (a practice system, form or script posts to it). The payload carries the client folder's Drive URL and the letter's fields.
2. **Code** pulls the Drive folder ID out of `folder_path` and stamps the current time.
3. **Google Docs** copies your termination template into that folder, fills in the template fields (termination date, provider, practice, address, credential and tax references) and names the document with the practice, provider and time. Fields with no value are left as their `{{placeholder}}`.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (the alias is the app's slug):
   - `google-docs`: the Google account that owns the template and the client folders.
3. **Constants:**
   - `TEMPLATE_DOC_ID`: the long ID in the template document's URL.
   - `TITLE_PREFIX`: the start of each new document's name. Defaults to `"Termination letter"`.
4. **Template:** a Google Doc with these placeholders, spelled exactly: `{{termination_date}}`, `{{provider_name}}`, `{{practice_name}}`, `{{practice_address}}`, `{{credential_ref}}`, `{{tax_ref}}`. Copy the template's name and layout to your own letter wording; keep the placeholder names or change them in the code.
5. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point their practice system at.

## Ask the user

- Which Google Doc is the termination template?
- Which Google account should own the new letters, and is the client folder in that account's My Drive or a shared drive?
- What does the sending system call each field? The code expects `folder_path` (the client folder's Drive URL), `provider_name`, `practice_name`, `practice_address`, `credential_ref`, `tax_ref` and `termination_date`. Rename them in the code if the sender uses other names.
- Should the letter's date default to today when the payload has none? (The build defaults to today.)

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, with a folder the connected account can write to:

```json
{
  "folder_path": "https://drive.google.com/drive/folders/YOUR_FOLDER_ID",
  "provider_name": "Dr. Test Provider",
  "practice_name": "Test Practice",
  "practice_address": "1 Test Street, New York, NY",
  "credential_ref": "CRED-000",
  "tax_ref": "TAX-000",
  "termination_date": "October 31, 2026"
}
```

Confirm that the run completes, a new document is in the folder with the title built from the practice and provider, and the document's text shows each value in place of its placeholder. Then delete the test document, and tell the user to delete it too if they used real data.

## Customize

- **Convert to PDF and attach to the CRM record:** add a step after the letter is created that exports it and attaches it to the client's record in the CRM.
- **Legal review before sending:** route each new document to a review channel and wait for approval before anyone sends it.

## Notes

- The new document is private to the connected account until someone shares it.
- Google Docs keeps any unused placeholder as written, so a missing field shows up in the letter instead of disappearing. Check the letter before it goes out.
- The title's timestamp is ISO format so that repeated runs never collide.
- Never commit a real template ID, folder ID or webhook URL. Anyone with the webhook URL can create letters in the connected account.
