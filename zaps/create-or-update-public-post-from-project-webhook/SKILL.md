---
name: create-or-update-public-post-from-project-webhook
description: Build a Zap on Zapier that publishes or updates a public release-notes post when a project event arrives by webhook, records the post in a tracking table, and tells the team in Discord. Use when a product team announces project changes through a public changelog or release-notes page and wants that page kept in sync without manual posting.
license: MIT
metadata:
  author: zapier
  summary: "When a project update comes in, its public release-notes post is created or refreshed, the tracking table is updated, and the team gets a short Discord note."
  apps: "Webhooks by Zapier, Zapier Tables, Discord"
  category: "Product"
  job: "Digital product operations"
  source: "https://zapier.com/automations/product/digital-product-operations/release-notes-management/create-or-update-public-post-from-project-webhook"
---

# Create or update public post from project webhook

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-or-update-public-post-from-project-webhook. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a project event arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`) with `project_reference`, `title`, `description` and `status`. A project tool or script posts to the hook.
2. **Zapier Tables** looks up the row whose project reference matches. If there is no reference, the run stops.
3. **The CMS posts API** is called. If the row already holds a post ID, that post is updated; otherwise a new one is created in the default category. The post ID is kept.
4. **Zapier Tables** creates the row (no match) or updates it (match), storing the project reference, the post ID and the status.
5. **Discord** posts one short line with the title, project reference and status to the team channel.

The Discord message never pings anyone: `PING_MENTIONS` stays `false`.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                | What goes there                                                                 |
| ---------------------- | ------------------------------------------------------------------------------- |
| `TRACKING_TABLE_ID`    | The Zapier Tables table that tracks each project's public post                  |
| `CMS_POSTS_URL`        | The URL of the CMS posts endpoint, such as `https://<their CMS host>/api/posts` |
| `CMS_DEFAULT_CATEGORY` | The CMS category every post is published under                                  |
| `DISCORD_CHANNEL_ID`   | The Discord channel that gets the team summary                                  |

Also review the defaults with them: `REFERENCE_FIELD`, `POST_ID_FIELD` and `STATUS_FIELD` are the tracking table's field keys for the project reference, CMS post ID and publish status, so map them to the user's column names. Keep `PING_MENTIONS` `false`.

Ask what the project tool sends. The payload must carry `project_reference`, `title`, `description` and `status`. If its field names differ, change the input schema in `workflow.ts` before publishing.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `zapier-tables` to the user's Zapier Tables connection (for the tracking table), `discord` to their Discord connection (for the team channel), and `cms_api` to their CMS connection. The CMS is not a Zapier app, so connect it in the CMS's own app or through a Zapier app that wraps it. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with the tracking table, CMS category and Discord channel set to ones the user controls, so the test touches no real posts. Use this sample:

```json
{
  "project_reference": "PRJ-1042",
  "title": "Dark mode for dashboards",
  "description": "Dashboards now follow the system theme.",
  "status": "released"
}
```

Check that the tracking row for `PRJ-1042` has the post ID and status, that the CMS post shows the new title and body, and that one line reached the Discord channel with no mention. If run-status tools aren't available, check the tracking table, the CMS and the Discord channel directly. Then publish, confirm the trigger is active, and ask the user to delete the test row, post and message. The user deletes test data, not the agent.

## Notes

- The CMS call runs through `sdk.fetch` with the `cms_api` connection, so that connection must exist before the workflow can publish.
- If two rows share a project reference, the lookup takes the first match.
- Anyone with the webhook URL can publish or change posts, so keep it private.
- To publish only some projects, such as those with a chosen tag, add a check before the CMS step.
- To send high-priority projects to a separate Discord channel, or to add an approval step before publishing, change the steps after the lookup.
