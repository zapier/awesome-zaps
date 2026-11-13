import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { SLACK_CHANNEL_ID } from "./config.ts";

const sdk = createZapierSdk();

// The reacted message, as the trigger delivers it with message detail set to content.
const InputSchema = z
  .object({
    message: z
      .object({
        raw_text: z.string().nullable().optional(),
        permalink: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

export default defineDurable("slack-reaction-triaging", async (ctx, input) => {
  const { message } = InputSchema.parse(input);
  const text = message?.raw_text ?? "(no message text)";
  return ctx.step("post-to-triage", () =>
    sdk.runAction({
      appKey: "slack",
      actionType: "write",
      actionKey: "channel_message",
      connection: "slack",
      inputs: {
        channel: SLACK_CHANNEL_ID,
        text: `Support request: ${text}\n${message?.permalink ?? ""}`,
      },
    }),
  );
});
