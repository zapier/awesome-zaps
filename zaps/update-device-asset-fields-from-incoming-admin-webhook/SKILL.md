---
name: update-device-asset-fields-from-incoming-admin-webhook
description: Build a Zap on Zapier that takes an admin submission posted to a webhook, reads the asset number and model out of the submitted device text, and writes them to the matching Notion page. Use when an admin form, script or check-in system posts device details and the Notion asset record should be kept complete without manual edits.
license: MIT
metadata:
  author: zapier
  summary: "When an admin submits device details, the matching Notion record gets its asset number and model filled in automatically, so the asset list stays complete."
  apps: "Webhooks by Zapier, Notion"
  category: "IT"
  job: "IT operations"
  source: "https://zapier.com/automations/it/it-operations/it-asset-management/update-device-asset-fields-from-incoming-admin-webhook"
---

# Update device asset fields from incoming admin webhook

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/update-device-asset-fields-from-incoming-admin-webhook. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** an admin submission arrives at a catch hook (`webhook`, `hook_v2`), which a form, script or check-in system posts to. The payload must carry `page_id` (the Notion page to update) and `device_text` (the raw device description).
2. **Parse:** the asset number and model are read from `device_text` by finding the words "asset" and "model" and taking the value after each. If neither is found, the run stops and writes nothing.
3. **Notion** (`notion`) updates the page named by `page_id`, writing `Asset:` and `Model:` lines into its body as Markdown.

The Zap only updates the page it is given. It never searches for a page or changes any other one.

## Ask the user

This zap has no `REPLACE_…` values to fill in per person. Review these defaults in `config.ts` with the user:

- `ASSET_LABEL`: the word before the asset number in `device_text`. Defaults to `"asset"`.
- `MODEL_LABEL`: the word before the model in `device_text`. Defaults to `"model"`.
- `CONTENT_FORMAT`: the format of the text written to the page. Defaults to `"markdown"`.

Then ask:

- What exact fields does the admin submission send? The build assumes `page_id` and `device_text`. If the sender uses other names, change `InputSchema` before installing.
- Which Notion database and properties hold the asset number and model? The build writes them into the page body, not into property columns (see Notes).
- Should a payload with no asset or model in its text stop silently, or raise an alert?

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `notion` to the user's Notion connection for the workspace that holds the asset records. `webhook` (Webhooks by Zapier) needs no account, so its `authentication_id` is `null`.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the Notion action's fields with the user's connection, and sample the webhook trigger to confirm its payload carries `page_id` and `device_text`, before the first test run. Fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a test page in the user's own Notion workspace:

```json
{
  "page_id": "TEST_NOTION_PAGE_ID",
  "device_text": "Laptop, Asset: AST-TEST-001, Model: MBP-14"
}
```

Check that the page body has `Asset: AST-TEST-001` and `Model: MBP-14` on their own lines, and that no other page changed. If run-status tools aren't available, check the result in Notion directly. Then publish, confirm the trigger is active, and give the user their webhook URL to point their submission system at. Ask the user to delete the test lines from the test page.

## Notes

- The Zap writes into the page body, not property columns. Writing properties needs the database's property names, which can only be read through a connected Notion account.
- The asset and model come only from the submitted text: there is no lookup to a device directory or API. If `device_text` names more than one device, the first value of each label is used.
- Ideas for later: alert when a submission has an asset but no model (Slack or email), or create a follow-up task when `device_text` names more than one device.
- Anyone with the webhook URL can change Notion pages, so never commit a real page ID or webhook URL.
