import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { SLACK_CHANNEL, MENTION_PREFIX } from "./config.ts";

const sdk = createZapierSdk();

// Only alert for errors from these apps, matched against the alert's service name (e.g. "Slack").
// Leave empty to alert for every Zap error.
const ONLY_SERVICES: string[] = [];

const InputSchema = z
  .object({
    title: z.string().nullable().optional(),
    message: z.string().nullable().optional(),
    service: z.string().nullable().optional(),
    task_history_link: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
  "send-real-time-integration-failure-alerts-to-data-channel",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const service = input.service ?? "";

    if (ONLY_SERVICES.length > 0 && !ONLY_SERVICES.includes(service)) {
      return { skipped: true, reason: "service-not-in-filter", service };
    }

    const title = input.title ?? "Zap error";
    const text = [
      `${MENTION_PREFIX}:rotating_light: *${title}*`,
      input.message ? input.message : null,
      input.task_history_link
        ? `<${input.task_history_link}|Open task history>`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const notification = await ctx.step("send-slack-alert", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: "slack",
        inputs: {
          channel: SLACK_CHANNEL,
          text,
          link_names: MENTION_PREFIX ? "yes" : "no",
          unfurl: "no",
          add_edit_link: "no",
        },
      }),
    );

    const posted = notification.data?.[0] as
      { ts?: string; message?: { permalink?: string } } | undefined;
    return {
      alerted: true,
      title,
      service,
      ts: posted?.ts ?? null,
      permalink: posted?.message?.permalink ?? null,
    };
  },
);

export default workflow;
