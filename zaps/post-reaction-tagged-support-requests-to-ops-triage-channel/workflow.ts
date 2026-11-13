import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  TRIAGE_CHANNEL,
  SOURCE_CHANNEL,
  SUPPORT_REACTION,
  BOT_NAME,
  BOT_ICON,
} from "./config.ts";

const sdk = createZapierSdk();

// Set to true to let triage posts @-mention people and channels. Keep false for tests.
const ALLOW_MENTIONS = false;

const InputSchema = z
  .object({
    reaction: z.string().nullable().optional(),
    conversation: z.string().nullable().optional(),
    message: z
      .object({
        raw_text: z.string().nullable().optional(),
        permalink: z.string().nullable().optional(),
        channel: z
          .object({ name: z.string().nullable().optional() })
          .loose()
          .nullable()
          .optional(),
        user: z
          .object({ id: z.string().nullable().optional() })
          .loose()
          .nullable()
          .optional(),
      })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

const workflow = defineDurable(
  "post-reaction-tagged-support-requests-to-ops-triage-channel",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    if (input.reaction && input.reaction !== SUPPORT_REACTION) {
      return { skipped: true, reason: "reaction-not-support-reaction" };
    }
    if (input.conversation && input.conversation !== SOURCE_CHANNEL) {
      return { skipped: true, reason: "channel-not-source-channel" };
    }

    const requesterId = input.message?.user?.id ?? null;
    const requesterName = requesterId
      ? await ctx.step("find-requester-user", async () => {
          try {
            const lookup = await sdk.runAction({
              appKey: "slack",
              actionType: "search",
              actionKey: "user_by_id",
              connection: "slack",
              inputs: { id: requesterId, raw: "false" },
            });
            const user = lookup.data[0] as { real_name?: string } | undefined;
            return user?.real_name ?? null;
          } catch {
            return null;
          }
        })
      : null;

    const channelName =
      input.message?.channel?.name ?? input.conversation ?? "unknown channel";
    const requester = requesterName ?? requesterId ?? "unknown requester";
    const text = [
      `*Support request from #${channelName}*`,
      `Requester: ${requester}`,
      `Permalink: ${input.message?.permalink ?? "not available"}`,
      `Message: ${input.message?.raw_text ?? "(no text)"}`,
    ].join("\n");

    const posted = await ctx.step("post-triage-message", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: "slack",
        inputs: {
          channel: TRIAGE_CHANNEL,
          text,
          username: BOT_NAME,
          icon: BOT_ICON,
          as_bot: "yes",
          link_names: ALLOW_MENTIONS ? "yes" : "no",
          unfurl: "no",
          add_edit_link: "no",
        },
      }),
    );

    return { channel: channelName, requester, posted: posted.data[0] ?? null };
  },
);

export default workflow;
