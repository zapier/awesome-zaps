import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { ASSET_LABEL, MODEL_LABEL, CONTENT_FORMAT } from "./config.ts";

const sdk = createZapierSdk();

const InputSchema = z
  .object({
    page_id: z.string(),
    device_text: z.string().nullable().optional(),
  })
  .loose();

function extractValue(text: string, label: string): string | null {
  const match = text.match(
    new RegExp(`\\b${label}\\b[^A-Za-z0-9]*([A-Za-z0-9-]+)`, "i"),
  );
  return match ? match[1] : null;
}

const workflow = defineDurable(
  "update-device-asset-fields-from-incoming-admin-webhook",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const deviceText = input.device_text ?? "";
    const asset = extractValue(deviceText, ASSET_LABEL);
    const model = extractValue(deviceText, MODEL_LABEL);
    if (!asset && !model) {
      return {
        skipped: true,
        reason: "no-asset-or-model-in-device-text",
        pageId: input.page_id,
      };
    }

    const content = [
      asset ? `Asset: ${asset}` : null,
      model ? `Model: ${model}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const update = await ctx.step("update-notion-device-item", async () =>
      sdk.runAction({
        appKey: "notion",
        actionType: "write",
        actionKey: "update_database_item",
        connection: "notion",
        inputs: {
          page: input.page_id,
          content,
          content_format: CONTENT_FORMAT,
        },
      }),
    );

    return {
      pageId: input.page_id,
      asset,
      model,
      updated: update.data?.[0] ?? null,
    };
  },
);

export default workflow;
