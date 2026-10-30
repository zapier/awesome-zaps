---
name: create-creative-asset-records-from-task-webhook-entries
description: Build a Zapier Next Gen Zap that receives task webhook payloads carrying creative asset links and creates one Notion asset record per asset, parsed from its filename and linked to the task's request. Use when a design or creative team tracks assets in Notion and wants each task's files logged automatically from a webhook.
metadata:
  author: zapier
  summary: "When a task posts its creative assets, each file becomes a Notion asset record with its format, style, theme and creator read from the filename, linked to the original request."
  apps: "Webhooks by Zapier, Notion"
  category: "Design"
  job: "Creative operations"
  source: "https://zapier.com/automations/design/creative-operations/asset-management/create-creative-asset-records-from-task-webhook-entries"
---

# Create creative asset records from task webhook entries

## What it does

1. **Trigger:** a task system posts a payload to a Webhooks by Zapier catch hook. The payload carries the task ID, the task permalink, optional board ID and assignee, and a list of `assets` (each with a `title` and an `id`).
2. **Check:** if an asset link is given it must be `https://`. If the list of assets is empty, the run stops and writes nothing.
3. **Notion** searches the requests database for a row whose permalink matches the task. If none exists, it creates one.
4. **Parse:** for each asset, the filename (extension dropped) is split on `_` into format, visual style, source, theme, CTA and creator. The asset URL is built from the board ID and asset ID.
5. **Notion** creates one asset record per asset with the parsed fields, the URL, status `New`, and a relation to the request. One failed asset is counted and does not stop the others.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at its top.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `notion`: the user's Notion connection, for the workspace that holds both databases. Share both databases with that Notion integration first, or they will not appear in the picker.
3. **Constants:**
   - `REQUESTS_DATA_SOURCE` and `ASSETS_DATA_SOURCE`: the Notion data source IDs for the requests and assets databases.
   - `REQUEST_PERMALINK_PROPERTY`, `REQUEST_TITLE_PROPERTY`, `ASSET_TITLE_PROPERTY`, `ASSET_URL_PROPERTY`, `ASSET_REQUEST_PROPERTY`, `ASSET_STATUS_PROPERTY`, `ASSET_STATUS_NEW`: the Notion property names that match the user's databases.
   - `FILENAME_PROPERTIES`: which Notion property each filename segment fills.
   - `ASSET_URL_BASE`: the host that asset links point at.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point the task system at.

## Ask the user

- Which Notion databases hold the requests and the assets? Give their data source IDs.
- What are the exact property names in each database, including which property holds the task permalink and which is the relation from assets to requests?
- Does the filename use `_` between the six segments (format, visual style, source, theme, CTA, creator), and in that order? If not, change `FILENAME_PROPERTIES` and `parseFilename`.
- What host do asset links point at? Set `ASSET_URL_BASE`.
- Does the task system send the asset list in the payload? This workflow does not fetch assets from another app, so the list must come in the payload.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. It has no assets, so it writes nothing to Notion:

```json
{
  "task_id": "install-test-0",
  "task_permalink": "https://example.com/install-test/task/0",
  "asset_link": "https://example.com/install-test/boards/0",
  "board_id": "0",
  "assignee": "install-test",
  "assets": []
}
```

Expect `{ "skipped": true, "reason": "no-assets" }` and no Notion activity.

Then test the path that writes. Use a payload with one or two assets whose titles follow the filename pattern, against a test requests database and a test assets database (rows named `[install-test] …`). Check that:

- a request row exists whose permalink matches `task_permalink`, created if it was missing;
- one asset row per asset exists, with the parsed format, style, source, theme, CTA and creator, the URL built from the board and asset IDs, status `New`, and the relation to the request;
- the result reports `recorded` equal to the number of assets and `failed` as 0.

Then delete the test rows and tell the user to remove any left over.

## Customize

- **Notify a channel** when new assets are added: add a Slack step after the asset loop that posts one summary message to the creative channel.
- **Extend parsing rules** to recognise more filename prefixes: add a field to `FILENAME_PROPERTIES` and a matching property name.

## Notes

- Notion's own property types must match what the workflow sends. A select property takes one option name, and a relation takes a list of page IDs.
- Anyone with the webhook URL can create asset records in the database. Keep it private.
- Never commit a real Notion data source ID, asset host or webhook URL.
