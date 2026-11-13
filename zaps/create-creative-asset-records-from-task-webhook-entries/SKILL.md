---
name: create-creative-asset-records-from-task-webhook-entries
description: Build a Zap on Zapier that receives task webhook payloads carrying creative asset links and creates one Notion asset record per asset, parsed from its filename and linked to the task's request. Use when a design or creative team tracks assets in Notion and wants each task's files logged automatically from a webhook.
license: MIT
metadata:
  author: zapier
  summary: "When a task posts its creative assets, each file becomes a Notion asset record with its format, style, theme and creator read from the filename, linked to the original request."
  apps: "Webhooks by Zapier, Notion"
  category: "Design"
  job: "Creative operations"
  source: "https://zapier.com/automations/design/creative-operations/asset-management/create-creative-asset-records-from-task-webhook-entries"
---

# Create creative asset records from task webhook entries

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-creative-asset-records-from-task-webhook-entries. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a task system posts a payload to a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). The payload carries the task ID, the task permalink, optional board ID and assignee, and a list of `assets` (each with a `title` and an `id`).
2. **Check:** if an asset link is given it must be `https://`. If the list of assets is empty, the run stops and writes nothing.
3. **Notion** searches the requests database for a row whose permalink matches the task. If none exists, it creates one.
4. **Parse:** for each asset, the filename (extension dropped) is split on `_` into format, visual style, source, theme, CTA and creator. The asset URL is built from the board ID and asset ID.
5. **Notion** creates one asset record per asset with the parsed fields, the URL, status `New`, and a relation to the request. One failed asset is counted and does not stop the others.

The Zap only creates rows. It never edits or deletes an existing request or asset.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                | What goes there                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| `REQUESTS_DATA_SOURCE` | The Notion data source (database) of creative requests. Look it up from the database they name      |
| `ASSETS_DATA_SOURCE`   | The Notion data source (database) of creative asset records. Look it up from the database they name |
| `ASSET_URL_BASE`       | The host their asset links point at, with no trailing slash                                         |

Also review the defaults with them. The property names in `config.ts` must match their two databases exactly: which property holds the task permalink (`REQUEST_PERMALINK_PROPERTY`), the title, the asset URL, the relation from assets to requests, and the status with its `New` value. The defaults are `Permalink`, `Name`, `URL`, `Request`, `Status` and `New`.

Confirm these before building:

- Both databases are shared with the user's Notion integration, or they will not appear in the picker.
- The filename uses `_` between six segments (format, visual style, source, theme, CTA, creator), in that order. If not, change `FILENAME_PROPERTIES` and `parseFilename` in `workflow.ts`.
- The task system sends the asset list in the payload. This zap does not fetch assets from another app.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `notion` to the user's Notion connection for the workspace that holds both databases. Webhooks by Zapier needs none.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's Notion connection before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample once as a draft test. It has no assets, so it writes nothing to Notion:

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

Then run a payload with one or two assets whose titles follow the filename pattern, against a test requests database and a test assets database with rows named `[install-test] …`. Check that:

- a request row exists whose permalink matches `task_permalink`, created if it was missing;
- one asset row per asset exists, with the parsed format, style, source, theme, CTA and creator, the URL built from the board and asset IDs, status `New`, and the relation to the request;
- the result reports `recorded` equal to the number of assets and `failed` as 0.

If run-status tools aren't available, check the result in Notion directly. Then publish, confirm the trigger is active, and give the user the webhook URL to point the task system at. The user deletes the test rows, not the agent.

## Notes

- Notion's own property types must match what the workflow sends. A select property takes one option name, and a relation takes a list of page IDs.
- To notify a channel when assets are added, add a Slack step after the asset loop that posts one summary message.
- To recognise more filename prefixes, add a field to `FILENAME_PROPERTIES` and a matching property name.
- Anyone with the webhook URL can create asset records in the database. Keep it private, and never commit a real data source ID, asset host or webhook URL.
