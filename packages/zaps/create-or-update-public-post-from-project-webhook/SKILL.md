---
name: create-or-update-public-post-from-project-webhook
description: Build a Zapier Next Gen Zap that publishes or updates a public release-notes post when a project event arrives by webhook, records the post in a tracking table, and tells the team in Discord. Use when a product team announces project changes through a public changelog or release-notes page and wants that page kept in sync without manual posting.
metadata:
  author: zapier
  summary: "When a project update comes in, its public release-notes post is created or refreshed, the tracking table is updated, and the team gets a short Discord note."
  apps: "Webhooks by Zapier, Zapier Tables, Discord"
  category: "Product"
  job: "Digital product operations"
  source: "https://zapier.com/automations/product/digital-product-operations/release-notes-management/create-or-update-public-post-from-project-webhook"
---

# Create or update public post from project webhook

## What it does

1. **Trigger:** a project event arrives at a Webhooks by Zapier catch hook (a project tool or script posts to it) with `project_reference`, `title`, `description` and `status`.
2. **Zapier Tables** looks up the row whose project reference matches. If there is no reference, the run stops.
3. **Code** calls the CMS posts API. If the row already holds a post ID, it updates that post; otherwise it creates a new one in the default category. It keeps the post ID.
4. **Zapier Tables** creates the row (no match) or updates it (match), storing the project reference, the post ID and the status.
5. **Discord** posts one short line with the title, project reference and status to the team channel. Mentions are off.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug, except the CMS):
   - `zapier-tables`: the user's Zapier Tables connection, for the tracking table.
   - `discord`: the user's Discord connection, for the team channel.
   - `cms_api`: a connection to the CMS that hosts the public posts. It is not a Zapier app, so connect it in the CMS's own app or through a Zapier app that wraps it; the code calls it with `sdk.fetch`.
3. **Constants:**
   - `TRACKING_TABLE_ID`: the Zapier Tables table that tracks each project's post.
   - `REFERENCE_FIELD`, `POST_ID_FIELD`, `STATUS_FIELD`: the table's field keys (such as `new__data__f1`) for the project reference, CMS post ID and publish status. Map the user's column names to their keys.
   - `CMS_POSTS_URL`: the CMS posts endpoint.
   - `CMS_DEFAULT_CATEGORY`: the category every post is published under.
   - `DISCORD_CHANNEL_ID`: the team channel that receives the summary.
   - `PING_MENTIONS`: keep `false` so the summary never pings anyone.
4. Publish, wait until the trigger is active, and give the user their webhook URL to point the project tool at.

## Ask the user

- Which Zapier Tables table tracks the posts, and which fields hold the project reference, post ID and status?
- Which CMS and which endpoint publish the posts, and which category should they use?
- Which Discord channel gets the summary?
- What does the project tool send? The payload must carry `project_reference`, `title`, `description` and `status`; if its field names differ, change the input schema before installing.

## Test

Run this sample as a draft test run before publishing, with a project reference that exists in the user's tracking table and a CMS post you can safely change:

```json
{
  "project_reference": "PRJ-1042",
  "title": "Dark mode for dashboards",
  "description": "Dashboards now follow the system theme.",
  "status": "released"
}
```

Check that the tracking row for `PRJ-1042` has the post ID and status, that the CMS post shows the new title and body, and that one line reached the Discord channel with no mention. Then tell the user to revert the post and row if they were real data.

## Customize

- **Filter by initiative or tag:** add a check before the CMS step so only projects with a chosen tag are published.
- **High-priority route:** send projects with a high-priority status to a separate Discord channel, or add an approval step before publishing.

## Notes

- The CMS is not a Zapier app. Its call runs through `sdk.fetch` with the `cms_api` connection, so that connection must exist before the workflow can publish.
- If two rows share a project reference, the lookup takes the first match.
- Never commit a real spreadsheet, table, channel, CMS host or webhook URL. Anyone with the webhook URL can publish or change posts.
