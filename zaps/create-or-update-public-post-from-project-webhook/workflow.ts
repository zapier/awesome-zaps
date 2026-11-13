import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  TRACKING_TABLE_ID,
  REFERENCE_FIELD,
  POST_ID_FIELD,
  STATUS_FIELD,
  CMS_POSTS_URL,
  CMS_DEFAULT_CATEGORY,
  DISCORD_CHANNEL_ID,
} from "./config.ts";

const sdk = createZapierSdk();

// Ping users, roles and @everyone/@here in the Discord message. Keep false.
const PING_MENTIONS = false;

const InputSchema = z
  .object({
    project_reference: z.union([z.string(), z.number()]).nullable().optional(),
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
  "create-or-update-public-post-from-project-webhook",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const projectReference = String(input.project_reference ?? "").trim();
    if (!projectReference) {
      return { skipped: true, reason: "missing-project-reference" };
    }
    const title = input.title ?? "Untitled project";
    const description = input.description ?? "";
    const status = input.status ?? "published";

    const found = await ctx.step("find-tracking-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "search",
        actionKey: "find_record",
        connection: "zapier-tables",
        inputs: {
          table_id: TRACKING_TABLE_ID,
          filter_count: "1",
          field_data_key: REFERENCE_FIELD,
          operator: "exact",
          lookup_value: projectReference,
        },
      }),
    );

    const existing = found.data[0] as Record<string, unknown> | undefined;
    const existingPostId = existing?.[POST_ID_FIELD]
      ? String(existing[POST_ID_FIELD])
      : null;

    const post = await ctx.step("publish-cms-post", async () => {
      const response = await sdk.fetch(
        existingPostId ? `${CMS_POSTS_URL}/${existingPostId}` : CMS_POSTS_URL,
        {
          connection: "cms_api",
          method: existingPostId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            body: description,
            category: CMS_DEFAULT_CATEGORY,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(`CMS returned ${response.status}`);
      }
      const json = (await response.json()) as { id?: string | number };
      return { postId: String(json.id) };
    });

    const recordInputs = {
      table_id: TRACKING_TABLE_ID,
      [REFERENCE_FIELD]: projectReference,
      [POST_ID_FIELD]: post.postId,
      [STATUS_FIELD]: status,
    };

    if (existing?.id) {
      await ctx.step("update-tracking-record", async () =>
        sdk.runAction({
          appKey: "zapier-tables",
          actionType: "write",
          actionKey: "update_record",
          connection: "zapier-tables",
          inputs: { ...recordInputs, record_id: String(existing.id) },
        }),
      );
    } else {
      await ctx.step("create-tracking-record", async () =>
        sdk.runAction({
          appKey: "zapier-tables",
          actionType: "write",
          actionKey: "create_record",
          connection: "zapier-tables",
          inputs: recordInputs,
        }),
      );
    }

    const notice = await ctx.step("notify-discord-channel", async () =>
      sdk.runAction({
        appKey: "discord",
        actionType: "write",
        actionKey: "send_channel_message",
        connection: "discord",
        inputs: {
          channel_id: DISCORD_CHANNEL_ID,
          content: `${title} (${projectReference}): ${status}`,
          ping_usernames: PING_MENTIONS,
        },
      }),
    );

    return {
      projectReference,
      postId: post.postId,
      status,
      notified: notice.data[0] ?? null,
    };
  },
);

export default workflow;
