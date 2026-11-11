import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  TABLE_ID,
  CAPTION_FIELD,
  HASHTAGS_FIELD,
  IMAGE_FIELD,
  STAGE_FIELD,
  PUBLISH_READY_STAGE,
  IMAGE_STYLE,
  CAPTION_MODEL,
  IMAGE_MODEL,
} from "@/config";
import ai from "@/connections/ai";
import googleAiStudio from "@/connections/google-ai-studio";
import zapierTables from "@/connections/zapier-tables";

const sdk = createZapierSdk();

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
        connection: ai,
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
            connection: googleAiStudio,
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
        connection: zapierTables,
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
