---
name: update-device-asset-fields-from-incoming-admin-webhook
description: Build a Zapier Next Gen Zap that takes an admin submission posted to a webhook, reads the asset number and model out of the submitted device text, and writes them to the matching Notion page. Use when an admin form, script or check-in system posts device details and the Notion asset record should be kept complete without manual edits.
metadata:
  author: zapier
  summary: "When an admin submits device details, the matching Notion record gets its asset number and model filled in automatically, so the asset list stays complete."
  apps: "Webhooks by Zapier, Notion"
  category: "IT"
  job: "IT operations"
  source: "https://zapier.com/automations/it/it-operations/it-asset-management/update-device-asset-fields-from-incoming-admin-webhook"
---

# Update device asset fields from incoming admin webhook

## What it does

1. **Trigger:** an admin submission arrives at a Webhooks by Zapier catch hook (a form, script or check-in system posts to it). The payload must carry `page_id` (the Notion page to update) and `device_text` (the raw device description).
2. **Parse:** the asset number and model are read from `device_text` by looking for the words "asset" and "model" and taking the value after each. If neither is found, the run stops and writes nothing.
3. **Notion** updates the page named by `page_id`, writing `Asset:` and `Model:` lines into its body as Markdown.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, action `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (the alias in the code is the app's slug):
   - `notion`: the user's Notion connection, for the workspace that holds the asset records. Bind a work or integration connection; the build used none.
3. **Constants:**
   - `ASSET_LABEL`: the word that comes before the asset number in `device_text`. Defaults to `"asset"`.
   - `MODEL_LABEL`: the word that comes before the model in `device_text`. Defaults to `"model"`.
   - `CONTENT_FORMAT`: the format of the text written to the page. Defaults to `"markdown"`.

Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point their submission system at.

## Ask the user

- What exact fields does the admin submission send? The build assumes `page_id` and `device_text`. If the sender uses other names, change `InputSchema` before installing.
- Which Notion database and properties hold the asset number and model? The build writes them into the page body, not into property columns (see Notes).
- Should a payload with no asset or model in its text stop silently, or raise an alert?

## Test

Sample input for a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, using a `page_id` of a test page in the user's own Notion workspace:

```json
{
  "page_id": "YOUR_TEST_NOTION_PAGE_ID",
  "device_text": "Laptop, Asset: AST-TEST-001, Model: MBP-14"
}
```

The build attempted a draft run with `page_id` `install-test-no-such-page` and this `device_text`, and the attempt was rejected by the rate limit before anything ran. Confirm that the page body now has `Asset: AST-TEST-001` and `Model: MBP-14` on their own lines, and that no other page changed. Then remove those two lines from the test page.

## Customize

Not built. Options from the source spec, for later:

- **Alert on missing models:** send a Slack or email message when a submission has an asset but no model.
- **Follow-up task:** create a task when the device text names more than one device, since the build takes the first value it finds.

## Notes

- The source spec sent the lookup to an internal directory or device API with a stored token. No such endpoint or token was given, so that step is left out. The asset and model come from the submitted text instead.
- The spec also matched pages by an identifier and then searched for them. The build takes `page_id` straight from the payload, so no search is needed.
- Writing into property columns needs the database's property names, which can only be read through a connected Notion account. Until then the values go into the page body.
- Never commit a real Notion page ID or webhook URL. Anyone with the webhook URL can change Notion pages.
