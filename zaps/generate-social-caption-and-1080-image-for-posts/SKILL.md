---
name: generate-social-caption-and-1080-image-for-posts
description: Build a Zap on Zapier that writes a short caption, hashtags and a 1080x1080 image onto a content idea row in a Zapier Table, then marks the row publish-ready for review. Use when a content idea row in a Zapier Table should become a publish-ready social post. Good for social teams that keep post ideas in a table and want the assets ready without manual copywriting or design work.
license: MIT
metadata:
  author: zapier
  summary: "When a content idea goes into your table, its row gets a caption, hashtags and a square image, and is marked publish-ready for review."
  apps: "Zapier Tables, AI by Zapier, Google AI Studio (Gemini)"
  category: "Design"
  job: "Content media production"
  source: "https://zapier.com/automations/design/content-media-production/social-media-asset-creation/generate-social-caption-and-1080-image-for-posts"
---

# Generate social caption and 1080 image for posts

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/generate-social-caption-and-1080-image-for-posts. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a row in the content table is added or updated (`zapier-tables`, `new_or_updated_record`). The workflow reads the row's content idea.
2. **AI by Zapier** writes a short, friendly caption and 2 to 3 hashtags for the content idea.
3. **Google AI Studio (Gemini)** generates a square image in the style set by `IMAGE_STYLE`, using the content idea and the caption. It runs only when the row's image field is empty.
4. **Zapier Tables** writes the caption, hashtags and image URL to that same row and sets its stage to publish-ready.

Rows with no content idea, or already at publish-ready, are skipped. The Zap only writes to the table and never posts anything; a person decides what goes out.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting            | Where                                                                      | What goes there                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_TABLE_ID` | `config.ts` (`TABLE_ID`), `triggers/new-or-updated-record.ts` (`table_id`) | The Zapier Table that holds the content ideas. Look it up with the user's Zapier Tables connection; its long ID is in the table's URL. |

Also review the defaults with them:

- **Field keys:** `CAPTION_FIELD`, `HASHTAGS_FIELD`, `IMAGE_FIELD` and `STAGE_FIELD` in `config.ts`, and the content idea, image and stage keys (`new__data__f1`, `new__data__f4`, `new__data__f5`) in `workflow.ts`. The defaults are keys from the example table, so use the keys from the user's table, not the column names.
- **`PUBLISH_READY_STAGE`:** the stage value that marks a row ready. The default is `Publish-ready`; ask what they want it to say.
- **`IMAGE_STYLE`:** the default is `colorful`. Ask whether they want another style.
- **`CAPTION_MODEL` and `IMAGE_MODEL`:** the AI by Zapier model tier for the caption and the Gemini image model. The defaults are fine unless they say otherwise.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `zapier-tables` (the user's Zapier Tables connection, to read and update the rows), `ai` (the user's AI by Zapier connection, for the caption and hashtags) and `google-ai-studio` (the user's Google AI Studio connection, for the image) to the user's connections.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-or-updated-record.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test against a row the user created in a test table, with this input:

```json
{
  "record_id": "a-test-row-id",
  "new__data__f1": "Behind the scenes at our Friday product review",
  "new__data__f4": "",
  "new__data__f5": "Idea"
}
```

Check that the row's caption and hashtags are filled in, its image field holds an image URL, and its stage is `Publish-ready`. Then run the same row again: it should be skipped, because its stage is already ready. If run-status tools aren't available, check the result in Zapier Tables directly. Publish only after the test passes, and confirm the trigger is active. Ask the user to delete the test rows; the agent does not delete them.

## Notes

- The image is requested at 1080x1080 in the prompt only. Gemini takes no size setting, so check the output dimensions before production use.
- The workflow's own table update triggers it again. The publish-ready check stops that loop, so keep it in place.
- For campaign posts, set `IMAGE_STYLE` to `minimalistic` or `brand colors`.
- To notify a channel when a row is ready, add a Slack step after the table update.
- Never commit a real table ID. Anyone who can edit the table can change what the workflow writes to it.
