import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables table ID to watch and write back to (the long ID in the table's URL).
const TABLE_ID = "YOUR_TABLE_ID";
// Field key for the caption, written by the workflow.
const CAPTION_FIELD = "new__data__f2";
// Field key for the hashtags, written by the workflow.
const HASHTAGS_FIELD = "new__data__f3";
// Field key for the image URL, written only when the image field is empty.
const IMAGE_FIELD = "new__data__f4";
// Field key for the stage, set to PUBLISH_READY_STAGE when the row is done.
const STAGE_FIELD = "new__data__f5";
// Stage value that marks a row publish-ready. Rows already at this stage are skipped, so the workflow's own update does not loop.
const PUBLISH_READY_STAGE = "Publish-ready";
// Style requested in the image prompt.
const IMAGE_STYLE = "colorful";
// AI by Zapier model for the caption and hashtags.
const CAPTION_MODEL = "standard/auto";
// Gemini model for the image.
const IMAGE_MODEL = "gemini-2.5-flash-image-preview";

const InputSchema = z
  .object({
    record_id: z.union([z.string(), z.number()]).nullable().optional(),
    // Content idea field (the field key in the trigger payload).
    new__data__f1: z.string().nullable().optional(),
    new__data__f4: z.string().nullable().optional(),
    new__data__f5: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "generate-social-caption-and-1080-image-for-posts",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const recordId = String(input.record_id ?? "").trim();
    if (!recordId) {
      return { skipped: true, reason: "no-record-id" };
    }

    const contentIdea = (input.new__data__f1 ?? "").trim();
    if (!contentIdea) {
      return { skipped: true, reason: "empty-content-idea", recordId };
    }

    if (input.new__data__f5 === PUBLISH_READY_STAGE) {
      return { skipped: true, reason: "already-publish-ready", recordId };
    }

    const copy = await ctx.step("generate-caption-and-hashtags", async () => {
      const result = await sdk.runAction({
        appKey: "ai",
        actionType: "write",
        actionKey: "get_completion",
        connection: "ai",
        inputs: {
          model_id: CAPTION_MODEL,
          authentication_id: "0",
          instructions:
            "Write a short, friendly social media caption for the content idea in inputFields, and 2-3 relevant hashtags. Do not claim to have posted anything.",
          inputFields: { contentIdea },
          includeWorkflowData: false,
          outputFields: [
            { name: "caption", type: "text", isRequired: true },
            { name: "hashtags", type: "text", isRequired: true },
          ],
        },
      });
      const output = result.data?.[0] as
        { caption?: string; hashtags?: string } | undefined;
      return {
        caption: output?.caption ?? "",
        hashtags: output?.hashtags ?? "",
      };
    });

    const hasImage = Boolean(input.new__data__f4?.trim());
    const image = hasImage
      ? null
      : await ctx.step("generate-post-image", async () => {
          const result = await sdk.runAction({
            appKey: "google-ai-studio",
            actionType: "write",
            actionKey: "generate_image",
            connection: "google-ai-studio",
            inputs: {
              model: IMAGE_MODEL,
              apiVersion: "v1beta",
              prompt: `Create a ${IMAGE_STYLE}, square 1080x1080 social media image for this post. Content idea: ${contentIdea}. Caption: ${copy.caption}`,
            },
          });
          const output = result.data?.[0] as { url?: string } | undefined;
          return { url: output?.url ?? "" };
        });

    const updated = await ctx.step("write-assets-to-table", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "update_record",
        connection: "zapier-tables",
        inputs: {
          table_id: TABLE_ID,
          record_id: recordId,
          [CAPTION_FIELD]: copy.caption,
          [HASHTAGS_FIELD]: copy.hashtags,
          ...(image ? { [IMAGE_FIELD]: image.url } : {}),
          [STAGE_FIELD]: PUBLISH_READY_STAGE,
        },
      }),
    );

    return {
      recordId,
      caption: copy.caption,
      hashtags: copy.hashtags,
      image: image?.url ?? null,
      updated: updated.data?.[0] ?? null,
    };
  },
);

export default workflow;
