---
name: generate-social-caption-and-1080-image-for-posts
description: Use when a content idea row in a Zapier Table should become a publish-ready social post. Writes a short caption and hashtags, generates a 1080x1080 colorful image, and saves both back to the same row for review. Good for social teams that keep post ideas in a table and want the assets ready without manual copywriting or design work.
metadata:
  author: zapier
  summary: "When a content idea goes into your table, its row gets a caption, hashtags and a square image, and is marked publish-ready for review."
  apps: "Zapier Tables, AI by Zapier, Google AI Studio (Gemini)"
  category: "Design"
  job: "Content media production"
  source: "https://zapier.com/automations/design/content-media-production/social-media-asset-creation/generate-social-caption-and-1080-image-for-posts"
---

# Generate social caption and 1080 image for posts

## What it does

1. **Trigger:** a row in your content table is added or updated. The workflow reads its content idea.
2. **AI by Zapier** writes a short, friendly caption and 2 to 3 hashtags for the content idea.
3. **Google AI Studio (Gemini)** generates a square, colorful image for the post, using the content idea and the caption. It runs only when the row's image field is empty.
4. **Zapier Tables** writes the caption, hashtags and image URL to that same row and sets its stage to publish-ready.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Zapier Tables, New or Updated Record (`zapier-tables`, `new_or_updated_record`). Its `table_id` is the table to watch.
2. **Connections** (each alias in the code is the app's slug):
   - `zapier-tables`: the user's Zapier Tables connection.
   - `ai`: the user's AI by Zapier connection.
   - `google-ai-studio`: the user's Google AI Studio connection.
3. **Constants:**
   - `TABLE_ID`: the table's long ID from its URL.
   - `CAPTION_FIELD`, `HASHTAGS_FIELD`, `IMAGE_FIELD`, `STAGE_FIELD`: the field keys for caption, hashtags, image and stage. Use the keys from the user's table (`new__data__f2` and so on), not the column names.
   - `PUBLISH_READY_STAGE`: the stage value that marks a row ready. Default is `"Publish-ready"`.
   - `IMAGE_STYLE`: style word in the image prompt. Default is `"colorful"`. Use `"minimalistic"` or `"brand colors"` for campaign posts.
   - `CAPTION_MODEL`: AI by Zapier model tier for the caption. Default is `"standard/auto"`.
   - `IMAGE_MODEL`: Gemini image model. Default is `"gemini-2.5-flash-image-preview"`.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the trigger's webhook details if the trigger shows one.

## Ask the user

- Which table holds the content ideas, and which fields are the content idea, caption, hashtags, image and stage?
- What should the stage say when a row is ready? Default is `Publish-ready`.
- Should the imagery style be something other than colorful?

## Test

Run this sample as a test run before publishing, against a row in a test table:

```json
{
  "record_id": "YOUR_RECORD_ID",
  "new__data__f1": "Behind the scenes at our Friday product review",
  "new__data__f4": "",
  "new__data__f5": "Idea"
}
```

Check that the row's caption and hashtags are filled in, its image field holds an image URL, and its stage is `Publish-ready`. Then run the same row again: it should be skipped because its stage is already ready. Only change rows you created for the test.

## Customize

- **Imagery style:** switch the style to minimalistic or brand colors for campaign-specific posts.
- **Notify a channel:** add a Slack step after the table update that posts when a row reaches publish-ready.

## Notes

- The image is requested at 1080x1080 in the prompt only. Gemini does not take a size setting, so check the output dimensions for production use.
- The workflow's own table update triggers it again. The publish-ready check stops that loop, so keep the stage check in place.
- Never commit a real table ID. Anyone who can edit the table can change what the workflow writes to it.
